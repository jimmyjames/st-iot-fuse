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
        console.log("getDevice not implemented yet");
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

async function getDevices(options, devicesAccum) {
    console.log("getDevices (private) not implemented yet");
}

async function getDeviceStatus(options) {
    console.log("getDeviceStatus (private) not implemented yet");
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