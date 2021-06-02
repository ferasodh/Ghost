const _ = require('lodash');

const api = require('./api').v2;
const GhostMailer = require('./services/mail').GhostMailer;
const config = require('../shared/config');
const urlUtils = require('./../shared/url-utils');

const i18n = require('../shared/i18n');
const logging = require('../shared/logging');
const request = require('./lib/request');
const ghostVersion = require('./lib/ghost-version');
const UpdateCheckService = require('./update-check-service');

const ghostMailer = new GhostMailer();
let updateChecker;

module.exports = () => {
    const allowedCheckEnvironments = ['development', 'production'];

    // CASE: The check will not happen if your NODE_ENV is not in the allowed defined environments.
    if (_.indexOf(allowedCheckEnvironments, process.env.NODE_ENV) === -1) {
        return;
    }

    if (updateChecker === undefined) {
        updateChecker = new UpdateCheckService({
            api: {
                settings: {
                    read: api.settings.read,
                    edit: api.settings.edit
                },
                posts: {
                    browse: api.posts.browse
                },
                users: {
                    browse: api.users.browse
                }
            },
            config: {
                mail: config.get('mail'),
                env: config.get('env'),
                databaseType: config.get('database').client,
                checkEndpoint: config.get('updateCheck:url'),
                isPrivacyDisabled: config.isPrivacyDisabled('useUpdateCheck'),
                notificationGroups: this.config.get('notificationGroups'),
                siteUrl: config.get('url'),
                forceUpdate: config.get('updateCheck:forceUpdate')
            },
            i18n,
            logging,
            urlFor: urlUtils.urlFor,
            request,
            ghostVersion,
            ghostMailer
        });
    }

    updateChecker.check();
};
