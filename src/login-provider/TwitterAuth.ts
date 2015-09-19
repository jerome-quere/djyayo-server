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

///<reference path="../../typings/passport-twitter/passport-twitter.d.ts"/>

import _ = require('lodash');
import url = require('url');
import express = require('express');
import passportTwitter = require('passport-twitter');

import { ILoginProviderAuthUrls, ILoginProviderUser, ILoginProviderCallback } from './index';

interface ITwitterAuthConfig {
    appId:string;
    appSecret:string;
}

/**
 *
 */
export class TwitterAuth {

    /**
     *
     */
    public static register(config:ITwitterAuthConfig,
                           passport:any,
                           expressApp:express.Express,
                           onLoginCb:ILoginProviderCallback,
                           urls:ILoginProviderAuthUrls):void {

        let options:passportTwitter.IStrategyOption = {
            consumerKey: config.appId,
            consumerSecret:  config.appSecret,
            callbackURL:  urls.callbackUrl
        };

        let callbackURL:url.Url = url.parse(urls.callbackUrl);

        passport.use(new passportTwitter.Strategy(options, _.bind(TwitterAuth.onLogin, this, onLoginCb)));
        expressApp.get(urls.authUrl, passport.authenticate('twitter'));
        expressApp.get(callbackURL.pathname, passport.authenticate('twitter', {
            successRedirect: urls.successUrl,
            failureRedirect: urls.errorUrl
        }));
    }

    /**
     *
     */
    private static onLogin( onLoginCb:ILoginProviderCallback,
                            token:string,
                            tokenSecret:string,
                            profile:any,
                            done:any):void {


        // TODO Make it work
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

