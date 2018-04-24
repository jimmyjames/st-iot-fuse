const axios = require("axios");
const qs = require("query-string");

// SmartThings API base URI
// See https://smartthings.developer.samsung.com/develop/api-ref/st-api.html
const API_URL = "https://api.smartthings.com/v1";

// NOTE: This is a temporary OAuth URL. Real base URI for OAuth will be:
// const OAUTH_URL = "https://api.smartthings.com";
const OAUTH_URL = "https://oauthin-regional.api.smartthings.com";
const api = axios.create({
    timeout: false,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
});

module.exports = {
    getDevice: async options => {
        try {
            // get all devices
            let devices = await getDevices(options, []);

            // get a list of devices by name and ID
            let deviceMapping = devices.data.items.map(item => {
                return { id: item.deviceId, name: item.label || item.name };
            });

            // find the device with the name requested
            let device = deviceMapping.find(element => {
                return element.name.toLowerCase() === options.name.toLowerCase();
            });
            
            return device;
        } catch (err) {
            console.log(err);
        }
    },

    getDeviceStatus: async (options, callback) => {
        console.log("getDeviceStatus not implemented yet");
    },

    getDevices: async options => {
        return await getDevices(options, []);
    },

    actuateDevice: async options => {
        console.log("actuateDevice not implemented yet");
    },

    actuateDevices: async options => {
        console.log("actuateDevices not implemented yet");
    }
};

/*
 * private method to implement a call to get the devices list from the SmartThings API
 * 
 * @param options - Pass the following in an object:
 *      {
 *          // the name of the device
 *            name: "name of the device", 
 *
 *           // the capability to filter results by
 *           capability: "capability", 
 *
 *           // the slack controller
 *           controller: controller,
 *
 *           // the slack user
 *           user: message.user_profile
 *       }
 */
async function getDevices(options, devicesAccum) {
    // TODO
    // see List Devices API documentation at https://smartthings.developer.samsung.com/develop/api-ref/st-api.html#operation/getDevices
    // HINT: see getDeviceStatus function below for how the API call should look.
    // Note you will also need to pass the capability as a query parameter (can add "params: {some-key: some-val}" to the request options)
    console.log("getDevices (private) not implemented yet");
}

async function getDeviceStatus(options) {
    return await api.get(`${API_URL}/devices/${options.id}/status`, {
        headers: {
            Authorization: `Bearer ${options.user.smartThings.accessToken}`
        },
        user_profile: options.user,
        controller: options.controller
    });
}

async function getRefreshedToken(refreshToken) {
    var formData = qs.stringify({
        grant_type: "refresh_token",
        client_id: process.env.stClientId,
        client_secret: process.env.stClientSecret,
        refresh_token: refreshToken,
        redirect_uri: `${process.env.host}/st/oauth`
    });
    return await api.post(`${OAUTH_URL}/oauth/token`, formData, {
        auth: {
            username: process.env.stClientId,
            password: process.env.stClientSecret
        },
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}


// Automatically refresh failed authorization
api.interceptors.response.use(
    response => response,
    error => {
        return new Promise((resolve, reject) => {
            if (error.config && error.response && error.response.status === 401 && !error.config._retry) {
                error.config._retry = true;

                error.config.controller.storage.users.get(error.config.user_profile.id, (err, user) => {
                    getRefreshedToken(user.smartThings.refreshToken)
                        .then(token => {
                            user.smartThings.accessToken = token.data.access_token;
                            user.smartThings.refreshToken = token.data.refresh_token;
                            error.config.controller.storage.users.save(user);
                            error.config.headers.Authorization = `Bearer ${token.data.access_token}`;

                            console.log(`Refreshed stale access token: ${JSON.stringify(token.data)}`);
                            return api.request(error.config).then(resolve, reject);
                        })
                        .catch(reason => {
                            return reject(reason);
                        });
                });
            }
        });
    }
);