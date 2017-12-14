'use strict'

const Storage = require("../../app/services/storage"),
fileCacheStorage = require("../../app/services/file_cache_storage"),
  FileStorage = require("../../app/services/file_storage")

const storage = new Storage()

storage.use(FileStorage)

global.storage = storage
