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

///<reference path="../../typings/express/express.d.ts"/>


import when = require('when');
import fn = require('when/function');
import express = require('express');
import http = require('http');
import _ = require("lodash");

import { Config } from './Config';
import { Model } from '../model/index';
import { Logger } from '../utils/Logger'

export class HttpServer {

    private httpServer:any;
    private expressApp:any;
    private config:Config;
    private model:Model;

    private startDefer:When.Deferred<void> = null;

    /**
     *
     */
    constructor(config:Config, model:Model) {

        this.config = config;
        this.model = model;
        this.expressApp = express();

        this.expressApp.use((req:express.Request, res:express.Response, next:()=>any) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

        this.httpServer = http.createServer(this.expressApp);
        this.httpServer.on("error", _.bind(this.onHttpError, this));
    }

    /**
     *
     */
    public start():When.Promise<void> {

        this.startDefer = when.defer<void>();
        this.httpServer.listen(this.config.getHttpPort(), () => {
            this.startDefer.resolve();
            this.startDefer = null;
            this.initRoutes();
        });

        return this.startDefer.promise;
    }

    /**
     *
     */
    private initRoutes() {

        var buildHandler = (handler:(req:express.Request, res:express.Response)=>any) => {
            return (req:express.Request, res:express.Response) => this.onHttpRequest(req, res, handler);
        };

        this.expressApp.get('/rooms', buildHandler(_.bind(this.onRoomsRequest, this)));
    }

    /**
     *
     */
    private onRoomsRequest(req:express.Request, res:express.Response) {
        return this.model.getRoomManager().findAll();
    }

    /**
     *
     */
    private onHttpRequest(request:express.Request, response:express.Response,
                          handler:(request:express.Request, response:express.Response)=>any) {

        var promise = fn.call(handler, request, response);
        promise.then((data) => {
            response.json({code: 200, msg: "Success", data: data});
        });
        promise.otherwise((error) => {
            var code = (_.isNumber(error.code)) ? error.code : 500;
            var msg = (_.isString(error.msg)) ? error.msg : "" + error;
            if (error.stack)
                Logger.error(error);
            response.json({code: code, msg: msg, data: null});
        });
    }

    /**
     *
     */
    private onHttpError(e:Error) {
        if (! _.isNull(this.startDefer)) {
            this.startDefer.reject(e);
            return;
        }
        Logger.error("[httpServer]", e);
        throw e;
    }
}