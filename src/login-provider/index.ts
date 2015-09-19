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

import passport = require('passport');
import express = require('express');

import { FacebookAuth } from './FacebookAuth';
import { GoogleAuth } from './GoogleAuth';
import { TwitterAuth } from './TwitterAuth';

/**
 *
 */
export interface  ILoginProviderAuthUrls {
    authUrl:string;
    callbackUrl:string;
    successUrl:string;
    errorUrl:string;
}

/**
 *
 */
export interface  ILoginProviderUser {
    firstName:string;
    lastName:string;
    fullName:string;
    pictureUrl:string;
    sourceType:string;
    sourceId:number;
}

/**
 *
 */
export interface ILoginProviderCallback {
    (user:ILoginProviderUser): When.Promise<any>;
}

/**
 *
 */
export class LoginProviderManager {

    /**
     *
     */
    public static register(provider:string,
                    providerConfig:any,
                    passport:passport.Passport,
                    expressApp:express.Express,
                    onLoginCb:ILoginProviderCallback,
                    authUrls:ILoginProviderAuthUrls):void {

        switch (provider) {
            case "facebook":
                FacebookAuth.register(providerConfig, passport, expressApp, onLoginCb, authUrls);
                break;
            case "google":
                GoogleAuth.register(providerConfig, passport, expressApp, onLoginCb, authUrls);
                break;
            case "twitter":
                TwitterAuth.register(providerConfig, passport, expressApp, onLoginCb, authUrls);
                break;
            default:
                throw new Error(`Unknow login provider [${provider}]`);
        }
    }
}
