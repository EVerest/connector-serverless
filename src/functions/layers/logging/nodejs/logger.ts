/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { createLogger, transports, format } from "winston";

const logger = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(format.json()),
        }),
      ]
});

export { logger as AmazingLogger };