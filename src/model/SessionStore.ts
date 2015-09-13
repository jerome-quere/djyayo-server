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

import _ = require('lodash');
import events = require("events");
import session = require('express-session');

import { Database } from './Database';

/**
 *
 */
export class SessionStore extends events.EventEmitter implements  session.Store {

    private database:Database;
    private COLLECTION_NAME:string = "session";

    /**
     *
     */
    constructor(database:Database) {
        super();
        this.database = database;
    }

    /**
     *
     */
    public destroy(sid:string, callback:any):void {
        this.database.delete(this.COLLECTION_NAME, { _id: sid }).then(() => {
            callback(null);
        }).catch((error:any) => {
            callback(error);
        });
    }

    /**
     *
     */
    public clear(callback:any):void {
        this.database.truncate(this.COLLECTION_NAME).then(() => {
            callback(null);
        }).catch((error:any) => {
            callback(error);
        });
    }

    /**
     *
     */
    public length(callback:any):void {
        this.database.count(this.COLLECTION_NAME).then((count:number) => {
            callback(null, count);
        }).catch((error:any) => {
            callback(error, null);
        });
    }

    /**
     *
     */
    public get(sid:string, callback:any):void {
        this.database.findOne(this.COLLECTION_NAME, { _id: sid }).then((session:any) => {
            callback(null, session);
        }).catch((error:any) => {
            callback(error, null);
        });
    }

    /**
     *
     */
    public set(sid:string, session:any, callback:any):void {
        session._id = sid;
        this.database.upsert(this.COLLECTION_NAME, { _id: sid }, session).then(() => {
            callback(null);
        }).catch((error:any) => {
            callback(error);
        });
    }
}

/**
 * // TODO HACK This hack lives because we cant inherit from session.Store because of S**T .d.ts file
 */
_.extend(SessionStore.prototype, (<any>session)['Store'].prototype);
