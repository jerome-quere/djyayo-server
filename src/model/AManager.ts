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

///<reference path="../../typings/node-uuid/node-uuid.d.ts"/>


import _ = require('lodash');
import when = require('when');
import uuid = require('node-uuid');

import { Database } from './Database';
import { Entity } from './Entity';

/**
 *
 */
export class AManager<T> {

    protected database:Database;
    protected collectionName:string;

    /**
     *
     */
    constructor(database:Database, collectionName:string) {
        this.database = database;
        this.collectionName = collectionName;
    }

    /**
     *
     */
    public find(query:{}):When.Promise<T[]> {
        return this.database.findOne(this.collectionName, query).then((documents:{}[]) => {
            if (_.isNull(documents)) {
                return [];
            }
            return when.map(documents, (document:{}) => {
                return this.buildObject(document);
            });
        });
    }

    /**
     *
     */
    public findOne(query:{}):When.Promise<T> {
        return this.database.findOne(this.collectionName, query).then((document:{}) => {
            if (_.isNull(document)) {
                return null;
            }
            return this.buildObject(document);
        });
    }

    /**
     *
     */
    public findAll():When.Promise<T[]> {
        return this.find({});
    }

    /**
     *
     */
    public findById(id:any):When.Promise<T> {
        return this.findOne({_id:id});
    }

    /**
     *
     */
    public deleteById(id:any):When.Promise<void> {
        return this.database.delete(this.collectionName, {_id:id});
    }

    /**
     *
     */
    public truncate():When.Promise<void> {
        return this.database.truncate(this.collectionName);
    }

    /**
     *
     */
    public count():When.Promise<number> {
        return this.database.count(this.collectionName);
    }

    /**
     *
     */
    public update(obj:T):When.Promise<void> {
        return this.database.update(this.collectionName, {_id: (<any>obj)['id']}, obj);
    }

    /**
     *
     */
    public upsert(obj:T, filters:{}):When.Promise<T> {
        let entity:Entity<T> = <Entity<T>>(<any>obj);
        if (_.isNull(entity._id)) {
            entity._id = uuid.v1();
        }

        return this.database.upsert(this.collectionName, filters, entity).then((document:{}) => {
            if (_.isNull(document)) {
                return null;
            }
            return this.buildObject(document);
        });
    }

    /**
     *
     */
    protected instanciate():Entity<T> {
        throw new Error(`Method must be override [${this.collectionName}]`);
    }

    /**
     *
     */
    protected buildObject(document:{}):When.Promise<T> {
        let obj:Entity<T> = this.instanciate();
        return obj.hydrate(document);
    }
}
