'use strict'

const Storage = require("../../app/services/storage"),
fileCacheStorage = require("../../app/services/file_cache_storage"),
  FileStorage = require("../../app/services/file_storage"),
  ErrorStorage = require("../../app/services/error_storage")

const storage = new Storage()
storage.use(FileStorage)

const errorStorage = new Storage()
errorStorage.use(ErrorStorage)

global.storage = storage
global.errorStorage = errorStorage
