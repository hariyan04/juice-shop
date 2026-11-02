/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import { type Request, type Response, type NextFunction } from 'express'

module.exports = function serveLogFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    const normalized = path.normalize(file)

    // Reject absolute paths, traversal (..), or any path containing separators
    if (!path.isAbsolute(file) && !normalized.startsWith('..') && path.basename(normalized) === normalized) {
      res.sendFile(path.resolve('logs/', normalized))
    } else {
      res.status(403)
      next(new Error('Invalid file name'))
    }
  }
}
