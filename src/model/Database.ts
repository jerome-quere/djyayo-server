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

/// <reference path="../../typings/nedb/nedb.d.ts" />

import NeDBDataStore = require('nedb')
import when = require('when');
import nodefn = require('when/node');
import _ = require('lodash');

export class Database {

    private dbs:{
        room:NeDBDataStore,
        user:NeDBDataStore
    };

    /**
     *
     */
    constructor(path:string) {
        this.dbs = {
            room: new NeDBDataStore({filename: `${path}/rooms.db`}),
            user:  new NeDBDataStore({filename: `${path}/users.db`})
        };
    }

    /**
     *
     */
    public start():When.Promise<void> {

        return when.map(_.values(this.dbs), (db:NeDBDataStore) => this.startDb(db)).then(() => {
            return this.initIndexes();
        });
    }

    /**
     *
     */
    public find(dbName:string, filters:{} = {}):When.Promise<{}[]> {

        if (! _.has(this.dbs, dbName)) {
            throw new Error(`Unknow database [${dbName}]`);
        }

        var db:NeDBDataStore = _.get(this.dbs, dbName, null);

        return <When.Promise<{}[]>>nodefn.call(_.bind(db.find, db), filters);
    }

    /**
     *
     */
    private initIndexes():When.Promise<void> {
        return nodefn.call(_.bind(this.dbs.room.ensureIndex, this.dbs.room), {fieldName: 'name', unique: true}).then(_.noop);
    }

    /**
     *
     */
    private startDb(db:NeDBDataStore):When.Promise<void> {

        var defer = when.defer<void>();

        db.loadDatabase(function (err) {
            if (err) {
                defer.reject(err)
            } else {
                defer.resolve();
            }
        });

        return defer.promise;
    }
}