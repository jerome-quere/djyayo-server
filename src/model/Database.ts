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

import NeDBDataStore = require('nedb');
import when = require('when');
import nodefn = require('when/node');
import _ = require('lodash');

/**
 *
 */
export class Database {

    private COMPACT_INTERVAL:number = 1000 * 60 * 60;

    private collections:{
        room:NeDBDataStore,
        user:NeDBDataStore,
        session:NeDBDataStore
    };

    /**
     *
     */
    constructor(path:string) {
        this.collections = {
            room: new NeDBDataStore({filename: `${path}/room.db`}),
            user: new NeDBDataStore({filename: `${path}/user.db`}),
            session: new NeDBDataStore({filename: `${path}/session.db`})
        };

        this.enableCompact();
    }

    /**
     *
     */
    public start():When.Promise<void> {

        return when.map(_.values(this.collections), (db:NeDBDataStore) => this.startDb(db)).then(() => {
            return this.initIndexes();
        });
    }

    /**
     *
     */
    public find(collectionName:string, filters:{} = {}):When.Promise<{}[]> {

        let db:NeDBDataStore = this.getCollectionOrThrow(collectionName);

        return <When.Promise<{}[]>>nodefn.call(_.bind(db.find, db), filters);
    }

    /**
     *
     */
    public findOne(collectionName:string, filters:{} = {}):When.Promise<{}> {

        let db:NeDBDataStore = this.getCollectionOrThrow(collectionName);

        return <When.Promise<{}>>nodefn.call(_.bind(db.findOne, db), filters);
    }


    /**
     *
     */
    public delete(collectionName:string, filters:{}):When.Promise<void> {

        let db:NeDBDataStore = this.getCollectionOrThrow(collectionName);

        return <When.Promise<void>>nodefn.call(_.bind(db.remove, db), filters, {multi: true}).then(_.noop);
    }

    /**
     *
     */
    public truncate(collectionName:string):When.Promise<void> {
        return this.delete(collectionName, {});
    }

    /**
     *
     */
    public count(collectionName:string):When.Promise<number> {

        let db:NeDBDataStore = this.getCollectionOrThrow(collectionName);

        return <When.Promise<number>>nodefn.call(_.bind(db.count, db), {});
    }

    /**
     *
     */
    public update(collectionName:string, filters:{}, document:{}):When.Promise<void> {

        let db:NeDBDataStore = this.getCollectionOrThrow(collectionName);

        return <When.Promise<void>>nodefn.call(_.bind(db.update, db), filters, document).then(_.noop);
    }

    /**
     *
     */
    public upsert(collectionName:string, filters:{}, document:{}):When.Promise<any> {

        let db:NeDBDataStore = this.getCollectionOrThrow(collectionName);

        return <When.Promise<any>>nodefn.call(_.bind(db.update, db), filters, document, {upsert: true}).then((args:any[]) => {
            if (args.length > 1) {
                return args[1];
            }
            return this.findOne(collectionName, filters);
        });
    }

    /**
     *
     */
    private initIndexes():When.Promise<void> {
        let promises:When.Promise<void>[] = [];
        promises.push(nodefn.call(_.bind(this.collections.room.ensureIndex, this.collections.room), {
            fieldName: 'name',
            unique: true
        }).then(_.noop));
        promises.push(nodefn.call(_.bind(this.collections.room.ensureIndex, this.collections.user), {fieldName: 'sourceId'}).then(_.noop));
        return when.all(promises).then(_.noop);
    }

    /**
     *
     */
    private getCollectionOrThrow(collectionName:string):NeDBDataStore {
        let db:NeDBDataStore = _.get(this.collections, collectionName, null);

        if (_.isNull(db)) {
            throw new Error(`Unknow database [${collectionName}]`);
        }

        return db;
    }

    /**
     *
     */
    private startDb(db:NeDBDataStore):When.Promise<void> {

        let defer:When.Deferred<void> = when.defer<void>();

        db.loadDatabase((err:any) => {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve();
            }
        });

        return defer.promise;
    }

    /**
     *
     */
    private enableCompact():void {
        _.forEach(this.collections, (collection:NeDBDataStore) => {
            collection.persistence.compactDatafile();
            collection.persistence.setAutocompactionInterval(this.COMPACT_INTERVAL);
        });
    }
}
