'use strict'

const Storage = require("../../app/services/storage"),
fileCacheStorage = require("../../app/services/fileCacheStorage"),
  FileStorage = require("../../app/services/fileStorage")

const storage = new Storage()

storage.use(FileStorage)

global.storage = storage
