import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const templatesDir = path.join(__dirname, './');

export const emailVerifyTemplate = handlebars.compile(
  fs.readFileSync(path.join(templatesDir, 'email-verify.html'), 'utf8')
);

export const emailPasswordResetTemplate = handlebars.compile(
  fs.readFileSync(path.join(templatesDir, 'email-password-reset.html'), 'utf8')
);
