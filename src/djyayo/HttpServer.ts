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
///<reference path="../../typings/express-session/express-session.d.ts"/>
///<reference path="../../typings/passport/passport.d.ts"/>
///<reference path="../../typings/passport-local/passport-local.d.ts"/>
///<reference path="../../typings/body-parser/body-parser.d.ts"/>
///<reference path="../../typings/express-session/express-session.d.ts"/>
///<reference path="../../typings/validator/validator.d.ts"/>

///<reference path="../../typings/djyayo/djyayo.d.ts"/>



import when = require('when');
import fn = require('when/function');
import express = require('express');
import bodyParser = require('body-parser');
import http = require('http');
import _ = require("lodash");
import passport = require('passport');
import session = require('express-session');
import validator = require('validator');

import { Config } from './Config';
import { Model, Room, User } from '../model/Model';
import { Logger } from '../utils/Logger';
import { HttpError } from './HttpError';

import { FacebookAuth } from '../social/FacebookAuth';
import { GoogleAuth } from '../social/GoogleAuth';


/**
 *
 */
export class HttpServer {

    private httpServer:any;
    private expressApp:express.Express;
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

        this.httpServer = http.createServer(this.expressApp);
        this.httpServer.on("error", _.bind(this.onHttpError, this));


        this.expressApp.use(bodyParser.json());

        this.enableCORS();
        this.configureSession();
        this.configurePassport();
        this.initRoutes();
    }

    /**
     *
     */
    public start():When.Promise<void> {

        this.startDefer = when.defer<void>();
        this.httpServer.listen(this.config.getHttpPort(), () => {
            this.startDefer.resolve();
            this.startDefer = null;
        });

        return this.startDefer.promise;
    }

    /**
     *
     */
    private enableCORS():void {
        this.expressApp.use((req:express.Request, res:express.Response, next:() => any) => {
            if (_.isString(req.header("Origin"))) {
                res.header("Access-Control-Allow-Origin", req.header("Origin"));
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.header("Access-Control-Allow-Credentials", "true");
            }
            next();
        });
    }

    /**
     *
     */
    private configureSession():void {
        this.expressApp.use(session({
            secret: this.config.getSessionSecret(),
            resave: false,
            name: 'session',
            saveUninitialized: true,
            store: this.model.getSessionStore()
        }));
        this.expressApp.use(function (req:express.Request, res:express.Response, next:any):void {
            if (! req.session.djyayo) {
                req.session.djyayo = {
                    loginSuccessUrl:null,
                    loginErrorUrl:null
                };
            }
            next();
        });
    }

    /**
     *
     */
    private configurePassport():void {

        // TODO add Twitter support
        this.expressApp.use(passport.initialize());
        this.expressApp.use(passport.session());

        let facebookAuth:FacebookAuth = new FacebookAuth(this.config, this.model);
        facebookAuth.register(passport, this.expressApp, {
            authUrl: '/auth/facebook',
            callbackUrl: '/auth/facebook/callback',
            successUrl: '/login/success',
            errorUrl: '/login/error'
        });

        let googleAuth:GoogleAuth = new GoogleAuth(this.config, this.model);
        googleAuth.register(passport, this.expressApp, {
            authUrl: '/auth/google',
            callbackUrl: '/auth/google/callback',
            successUrl: '/login/success',
            errorUrl: '/login/error'
        });

        passport.serializeUser(User.serialize);
        passport.deserializeUser(_.bind(User.deserialize, this, this.model));
    }

    /**
     *
     */
    private initRoutes():void {

        let buildHandler:any = (handler:(req:express.Request, res:express.Response) => any) => {
            return (req:express.Request, res:express.Response) => this.onHttpRequest(req, res, handler);
        };

        this.expressApp.get('/rooms', buildHandler(_.bind(this.onRoomsRequest, this)));
        this.expressApp.get('/me', buildHandler(_.bind(this.onMeRequest, this)));
        this.expressApp.get('/login', buildHandler(_.bind(this.onLoginRequest, this)));
        this.expressApp.get('/login/success', buildHandler(_.bind(this.onLoginSuccessRequest, this)));
        this.expressApp.get('/login/error', buildHandler(_.bind(this.onLoginErrorRequest, this)));
    }

    /**
     *
     */
    private onRoomsRequest(req:express.Request, res:express.Response):When.Promise<Room[]> {
        return this.model.getRoomManager().findAll();
    }


    /**
     *
     */
    private onMeRequest(req:express.Request, res:express.Response):{} {
        return {
            user: req.user
        };
    }

    /**
     *
     */
    private onLoginRequest(req:express.Request, res:express.Response):void {
        let type:string = _.get(req.query, "type", null);
        let successUrl:string = _.get(req.query, "success_url", null);
        let errorUrl:string = _.get(req.query, "error_url", null);

        if (!validator.isURL(successUrl) ||
            !validator.isURL(errorUrl)   ||
            !validator.isIn(type, ["facebook", 'google'])) {
            throw HttpError.badParams();
        }

        req.session.djyayo.loginSuccessUrl = successUrl;
        req.session.djyayo.loginErrorUrl = errorUrl;

        if (type === 'facebook') {
            res.redirect(302, "/auth/facebook");
        } else if (type === 'google') {
            res.redirect(302, "/auth/google");
        }
        return null;
    }

    /**
     *
     */
    private onLoginSuccessRequest(req:express.Request, res:express.Response):void {
        let url:string = _.get(req, "session.djyayo.loginSuccessUrl", "/");
        req.session.djyayo.loginSuccessUrl = null;
        req.session.djyayo.loginErrorUrl = null;
        res.redirect(url);
    }

    /**
     *
     */
    private onLoginErrorRequest(req:express.Request, res:express.Response):void {
        let url:string = _.get(req, "session.djyayo.loginErrorUrl", "/");
        req.session.djyayo.loginSuccessUrl = null;
        req.session.djyayo.loginErrorUrl = null;
        res.redirect(url);
    }

    /**
     *
     */
    private onHttpRequest(request:express.Request, response:express.Response,
                          handler:(request:express.Request, response:express.Response) => any):void {

        let promise:When.Promise<any> = fn.call(handler, request, response);
        promise.then((data:any) => {
            if (response.headersSent) {
                return;
            }
            response.json({code: 200, msg: "Success", data: data});
        });
        promise.otherwise((error:any) => {
            let code:number = (_.isNumber(error.code)) ? error.code : 500;
            let message:string = (_.isString(error.message)) ? error.message : "" + error;
            if (error.stack) {
                Logger.error(error);
            }
            response.json({code: code, msg: message, data: null});
        });
    }

    /**
     *
     */
    private onHttpError(e:Error):void {
        if (!_.isNull(this.startDefer)) {
            this.startDefer.reject(e);
            return;
        }
        Logger.error("[httpServer]", e);
        throw e;
    }
}
