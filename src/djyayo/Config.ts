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

/**
 *
 */
interface IFileConfig {
    http:{
        port:number;
        sessionSecret:string;
        hostname:string;
    };
    players:{
        port:number;
    };
    database:{
        path:string;
    };
    loginProvider: {
        facebook: {
            appId:string,
            appSecret:string;
        };
        google: {
            appId:string,
            appSecret:string;
        };
        twitter: {
            appId:string,
            appSecret:string;
        };
    };
}

/**
 *
 */
export class Config {

    private fileConfig:IFileConfig;

    /**
     *
     */
    constructor() {
        this.fileConfig = require('../../config.json');
    }

    /**
     *
     */
    public getHttpPort():number {
        return this.fileConfig.http.port;
    }

    /**
     *
     */
    public getHttpHostname():string {
        return this.fileConfig.http.hostname;
    }

    /**
     *
     */
    public getPlayerPort():number {
        return this.fileConfig.players.port;
    }

    /**
     *
     */
    public getDatabasePath():string {
        return this.fileConfig.database.path;
    }

    /**
     *
     */
    public getSessionSecret():string {
        return this.fileConfig.http.sessionSecret;
    }

    /**
     *
     */
    public getFacebookConfig():{appId:string, appSecret:string} {
        return this.fileConfig.loginProvider.facebook;
    }

    /**
     *
     */
    public getGoogleConfig():{appId:string, appSecret:string} {
        return this.fileConfig.loginProvider.google;
    }

    /**
     *
     */
    public getTwitterConfig():{appId:string, appSecret:string} {
        return this.fileConfig.loginProvider.twitter;
    }
}
