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

///<reference path="../../typings/passport-facebook/passport-facebook.d.ts"/>

import _ = require('lodash');
import url = require('url');
import express = require('express');
import passportFacebook = require('passport-facebook');

import { ILoginProviderAuthUrls, ILoginProviderUser, ILoginProviderCallback } from './index';

interface IFacebookAuthConfig {
    appId:string;
    appSecret:string;
}

/**
 *
 */
export class FacebookAuth {

    /**
     *
     */
    public static register(config:IFacebookAuthConfig,
                           passport:any,
                           expressApp:express.Express,
                           onLoginCb:ILoginProviderCallback,
                           urls:ILoginProviderAuthUrls):void {

        let options:passportFacebook.IStrategyOption = {
            clientID: config.appId,
            clientSecret:  config.appSecret,
            callbackURL:  urls.callbackUrl
        };

        let callbackURL:url.Url = url.parse(urls.callbackUrl);

        passport.use(new passportFacebook.Strategy(options, _.bind(FacebookAuth.onLogin, this, onLoginCb)));
        expressApp.get(urls.authUrl, passport.authenticate('facebook'));
        expressApp.get(callbackURL.pathname, passport.authenticate('facebook', {
            successRedirect: urls.successUrl,
            failureRedirect: urls.errorUrl
        }));
    }

    /**
     *
     */
    private static onLogin( onLoginCb:ILoginProviderCallback,
                            accessToken:string,
                            refreshToken:string,
                            profile:any,
                            done:any):void {

        let loginUser:ILoginProviderUser = {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            fullName: profile.displayName,
            pictureUrl: `https://graph.facebook.com/${profile.id}/picture`,
            sourceType: 'facebook',
            sourceId: profile.id
        };

        onLoginCb(loginUser)
            .then((user:any) => {
                done(null, user);
            })
            .catch((error:any) => {
                done(error, null);
            });
    }
}
