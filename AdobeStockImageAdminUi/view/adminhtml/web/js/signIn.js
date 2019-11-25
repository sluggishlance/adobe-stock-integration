// jscs:disable
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
// jscs:enable

define([
    'jquery',
    'Magento_AdobeIms/js/signIn',
    'Magento_AdobeIms/js/action/authorization',
    'Magento_Ui/js/modal/confirm'
], function ($, signIn, auth, confirm) {
    'use strict';

    return signIn.extend({

        defaults: {
            userQuota: {},
            // eslint-disable-next-line max-len
            dataProvider: 'name = adobe_stock_images_listing.adobe_stock_images_listing_data_source, ns = adobe_stock_images_listing',
            // eslint-disable-next-line max-len
            previewProvider: 'name = adobe_stock_images_listing.adobe_stock_images_listing.adobe_stock_images_columns.preview, ns = adobe_stock_images_listing',
            quotaUrl: 'adobe_stock/license/quota',
            modules: {
                source: '${ $.dataProvider }',
                preview: '${ $.previewProvider }'
            },
	   signInButtonSelector: "#adobeImsSignIn",
	   isSignInButtonClicked: false
        },

        /**
         * @inheritdoc
         */
        initObservable: function () {
            this._super().observe(['userQuota']);

            return this;
        },

        /**
         * Login to Adobe
         *
	 * @params
         * @return {window.Promise}
         */
        login: function (options = {}) {

            return new window.Promise(function (resolve, reject) {
                if (this.user().isAuthorized) {
                    return resolve();
                }
                auth(this.loginConfig)
                    .then(function (response) {
                        this.source().set('params.t ', Date.now());
                        this.loadUserProfile();
                        resolve(response);
                    }.bind(this))
                    .catch(function (error) {
                       options.showPopup ?
                         this.getLoginErrorPopup(error)
                         : reject(error);
                }.bind(this));
            }.bind(this));
        },

	/**
	 * Check if button SignIn was clicked.
	 */
	loginClick() {
           this.login({showPopup: true});
	},

        /**
         * Show popup that user failed to login.
         */
        getLoginErrorPopup: function (error) {
            confirm({
                title: $.mage.__('The user is not able to login'),
                content: error,
                buttons: [{
                    text: $.mage.__('Okay'),
                    class: 'action-primary',
                    attr: {},

                    /**
                     * Close modal on button click
                     */
                    click: function (event) {
                        this.closeModal(event);
                    }
                }]
            });
        },

        /**
         * Logout from adobe account
         */
        logout: function () {
            $.ajax({
                type: 'POST',
                url: this.logoutUrl,
                data: {
                    'form_key': window.FORM_KEY
                },
                dataType: 'json',
                context: this,
                showLoader: true,
                success: function () {
                    this.source().set('params.t ', Date.now());
                    this.user({
                        isAuthorized: false,
                        name: '',
                        email: '',
                        image: this.defaultProfileImage
                    });
                }.bind(this),

                /**
                 * @param {Object} response
                 * @returns {String}
                 */
                error: function (response) {
                    return response.message;
                }
            });
        },

        /**
         * Retrieves full user quota.
         */
        getUserQuota: function () {
            $.ajax({
                type: 'POST',
                url: this.quotaUrl,
                data: {
                    'form_key': window.FORM_KEY
                },
                dataType: 'json',
                context: this,

                /**
                 * @param {Object} response
                 * @returns void
                 */
                success: function (response) {
                    this.userQuota(response.result);
                },

                /**
                 * @param {Object} response
                 * @returns {String}
                 */
                error: function (response) {
                    return response.message;
                }
            });
        },

        /**
         * @inheritdoc
         */
        loadUserProfile: function () {
            $.ajax({
                type: 'POST',
                url: this.profileUrl,
                data: {
                    'form_key': window.FORM_KEY
                },
                dataType: 'json',
                context: this,

                /**
                 * @param {Object} response
                 * @returns void
                 */
                success: function (response) {
                    this.user({
                        isAuthorized: true,
                        name: response.result.name,
                        email: response.result.email,
                        image: response.result.image
                    });
                    this.getUserQuota();
                },

                /**
                 * @param {Object} response
                 * @returns {String}
                 */
                error: function (response) {
                    return response.message;
                }
            });
        }
    });
});
