/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'Magento_MediaGalleryUi/js/grid/columns/image/actions',
    'Magento_Ui/js/modal/alert',
    'underscore'
], function ($, Action, uiAlert, _) {
    'use strict';

    return Action.extend({
        defaults: {
            template: 'Magento_AdobeStockImageAdminUi/mediaGallery/grid/columns/image/licenseActions',
            licenseAction: {
                name: 'license',
                title: $.mage.__('License'),
                handler: 'licenseImageAction'
            },
            modules: {
                image: '${ $.imageComponent }'
            }
        },

        /**
         * Initialize the component
         *
         * @returns {Object}
         */
        initialize: function () {
            this._super();
            this.actionsList.push(this.licenseAction);

            return this;
        },

        /**
         * Init observable variables
         *
         * @return {Object}
         */
        initObservable: function () {
            this._super()
                .observe([
                    'visible'
                ]);

            return this;
        },

        /**
         * License image
         *
         * @param {Object} record
         */
        licenseImageAction: function (record) {
            this.getImageRecord(record.id);
        },

        /**
         * Check if image licensed
         *
         * @param {Object} record
         * @param {Object} name
         */
        isVisible: function (record, name) {
            if (name === this.licenseAction.name) {
                if (_.isNull(record['is_licensed'])) {
                    return false;
                }

                return !parseInt(record['is_licensed'], 16);
            }

            return true;
        },

        /**
         * Get image record and start license process
         *
         * @param {Number} imageId
         */
        getImageRecord: function (imageId) {
            $.ajax({
                type: 'GET',
                url: this.imageDetailsUrl,
                dataType: 'json',
                showLoader: true,
                data: {
                    'id': imageId
                },
                context: this,

                /**
                 * Success handler for deleting image
                 *
                 * @param {Object} response
                 */
                success: function (response) {
                    var currentRecord = this.image().displayedRecord();

                    response.imageDetails.id =  response.imageDetails['adobe_stock']['info'][0].value;
                    response.imageDetails.category =  response.imageDetails['adobe_stock']['info'][3].value;
                    this.image().displayedRecord(response.imageDetails['adobe_stock']['object']);
                    this.image().actions().login().login()
                        .then(function () {
                            if (this.image().actions().isLicensed()) {
                                this.image().actions().saveLicensed();
                            } else {
                                this.image().actions().showLicenseConfirmation(this.image().displayedRecord());
                            }
                        }.bind(this))
                        .catch(function (error) {
                            uiAlert({
                                content: error
                            });

                        })
                        .finally(function () {
                            this.image().displayedRecord(currentRecord);
                            this.imageModel().reloadGrid();
                        }.bind(this));

                }.bind(this),

                /**
                 * Error handler for deleting image
                 *
                 * @param {Object} response
                 */
                error: function (response) {
                    var message;

                    if (typeof response.responseJSON === 'undefined' ||
                        typeof response.responseJSON.message === 'undefined'
                    ) {
                        message = $.mage.__('There was an error on attempt to get the image details.');
                    } else {
                        message = response.responseJSON.message;
                    }
                    uiAlert({
                        content: message
                    });
                }
            });
        }
    });
});
