# smartthings-iotfuse-workshop

## About

This is the repository for the example SmartThings application we'll build at IoT Fuse 2018. 

We will build a Slack [slash command](https://api.slack.com/slash-commands) to allow you to control your home from Slack:

- `/smartthings turn on the kitchen lights`
- `/smartthings lock the doors`

> NOTE: This application uses a preview of a new beta feature to allow installations via OAuth. As this feature is not generally available it is subject to change.

## Workshop Format

We will build our app incrementally, and use [Git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging) for the different steps.
This will allow us to start from a common code base for each step.

We've provided a lot of the boilerplate and basic code, including leveraging [Botkit](https://www.botkit.ai), so we can focus on the fun stuff ;)

(Botkit includes a [middleware pipeline](https://github.com/howdyai/botkit/blob/master/docs/readme-middlewares.md) that allows for [plugins](https://botkit.ai/docs/readme-middlewares.html).)


## Step 0 - Bootstrapping

### Install required software and create accounts

This workshop requires the following software installed:

1. [Node.js](https://nodejs.org) and [npm](https://npmjs.com)
2. [ngrok](https://ngrok.com/) installed to create a secure tunnel to create a globally available URL for fast testing.

You also need to have a Samsung account and a Slack account, if you don't already have one:

1.  [Create a SmartThings account](https://account.samsung.com/membership/signUp.do) if you don't already have one.
2. Create a [Slack](https://slack.com/) account if you don't already have one, and create a new workspace for testing purposes.

If you don't already have it, you should also download the SmartThings mobile app, and sign in to it with your Samsung account.

### Get a SmartThings token

To create a SmartThings application, we'll need a SmartThings personal access token. Create a token with all "apps" scope selected, and store the token somewhere so you can access later - it will only be shown once!

Visit the [SmartThings personal access token page](https://account.smartthings.com/tokens) to create a token.

## Step 1 - Run the skeleton app

> NOTE: All commands are executed from the root project directory.

1. Clone this repository

    `git clone https://github.com/jimmyjames/st-iot-fuse.git`

2. Checkout the `step-1` tag

    `git checkout step-1`    

3.  Install dependencies

    ```
    npm i
    ```

4.  Checkout the SlackBot.js file

    ```
    git checkout node_modules/botkit/lib/SlackBot.js
    ```

5.  Copy `.env.example` --> `.env`

6.  Run the app

    ```
    npm start
    ```

7.  Or, Debug the app

    If using Visual Studio Code text editor:

    *   Press F5

8.  Open your browser to http://localhost:3000
9.  Follow the directions to complete setup (we'll do this together)

### Verifying our work so far

Once we have a Slack app installed to our test workspace, we can verify that we can link it to our SmartThings account and execute some commands (they aren't implemented yet, of course):

Type `/smartthings help` for help. Notice it prompts you to authorize, follow the steps to authorize with SmartThings.

Now that we've linked to our SmartThings account, we can try out the commands we'll build next:

- `/smartthings turn off the reading lights`
- `/smartthings turn on the kitchen lights`
- `/smartthings lock the doors`
- `/smartthings unlock the doors`

There are some other utility commands already implemented:

- `/smartthings (uptime|alive|debug)` - health check the app
- `/smartthings help` - basic command help
- `/smartthings (logout|gdpr|forget me)` - delete the SmartThings account details, will force you to reauthorize.
