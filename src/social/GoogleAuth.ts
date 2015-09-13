/*
 *The MIT License (MIT)
 *
 * Copyright (c) 2015 Jérôme Quéré <contact@jeromequere.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:#
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

///<reference path="../../typings/passport-google-oauth/passport-google-oauth.d.ts"/>

import _ = require('lodash');
import express = require('express');
import passportGoogle = require('passport-google-oauth');

import { Config } from '../djyayo/Config';
import { Model, User } from '../model/Model';

interface  IGoogleAuthUrls {
    authUrl:string;
    callbackUrl:string;
    successUrl:string;
    errorUrl:string;
}

/**
 *
 */
export class GoogleAuth {

    private config:Config;
    private model:Model;

    /**
     *
     */
    constructor(config:Config, model:Model) {
        this.config = config;
        this.model = model;
    }

    /**
     *
     */
    public register(passport:any, expressApp:express.Express, urls:IGoogleAuthUrls):void {

        let config:passportGoogle.IOAuth2StrategyOption = {
            clientID: this.config.getGoogleConfig().appId,
            clientSecret:  this.config.getGoogleConfig().appSecret,
            callbackURL: this.config.getHttpHostname() + urls.callbackUrl
        };

        passport.use(new passportGoogle.OAuth2Strategy(config, _.bind(this.onLogin, this)));

        expressApp.get(urls.authUrl, passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
        expressApp.get(urls.callbackUrl, passport.authenticate('google', {
            successRedirect: urls.successUrl,
            failureRedirect: urls.errorUrl
        }));
    }

    /**
     *
     */
    private onLogin(token:string, tokenSecret:string, profile:any, done:any):void {

        this.model.getUserManager().findOne({sourceType:"google", sourceId: profile.id}).then((user:User) => {

            if (_.isNull(user)) {
                user = new User();
                user.firstName = profile.name.givenName;
                user.lastName = profile.name.familyName;
                user.fullName = profile.displayName;
                user.pictureUrl = _.get(profile.photos, '0.value', null);
                user.sourceType = 'google';
                user.sourceId = profile.id;
            }

            return this.model.getUserManager().updateOrInsert(user).then((user2:User) => {
                done(null, user2);
            });

        }).catch((error:any) => {
            done(error, null);
        });
    }
}
