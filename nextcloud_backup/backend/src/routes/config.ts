import express from "express";
import {
  getBackupConfig,
  saveBackupConfig,
  validateBackupConfig,
} from "../services/backupConfigService.js";
import {
  getWebdavConfig,
  saveWebdavConfig,
  validateWebdavConfig,
} from "../services/webdavConfigService.js";
import { checkWebdavLogin } from "../services/webdavService.js";
import type { BackupConfig } from "../types/services/backupConfig.js";
import type { ValidationError } from "joi";
import type { WebdavConfig } from "../types/services/webdavConfig.js";

const configRouter = express.Router();

configRouter.get("/backup", (req, res) => {
  res.json(getBackupConfig());
});

configRouter.put("/backup", (req, res) => {
  validateBackupConfig(req.body as BackupConfig)
    .then(
      () => {
        return saveBackupConfig(req.body as BackupConfig);
      },
      (error: ValidationError) => {
        res.status(400).json(error.details);
      }
    )
    .then(
      () => {
        res.status(204).send();
      },
      () => {
        res.status(400).json({
          message: "Fail to init cron, please check cron config",
        });
      }
    );
});

configRouter.get("/webdav", (req, res) => {
  res.json(getWebdavConfig());
});

configRouter.put("/webdav", (req, res) => {
  validateWebdavConfig(req.body as WebdavConfig)
    .then(() => {
      return checkWebdavLogin(req.body as WebdavConfig, true);
    })
    .then(() => {
      saveWebdavConfig(req.body as WebdavConfig);
      res.status(204).send();
    })
    .catch((error: ValidationError) => {
      res.status(400);
      if (error.details) {
        res.json(error.details);
      } else {
        res.json(error);
      }
    });
});

export default configRouter;
