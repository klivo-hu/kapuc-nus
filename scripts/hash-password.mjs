// @ts-check
/**
 * Prints an ADMIN_PASSWORD_HASH for the given password.
 *
 *   npm run admin:hash                 # prompts; the password is not echoed
 *   echo -n 'jelszo' | npm run admin:hash
 *
 * The password is read from stdin rather than an argument so it never lands in shell history.
 */
import { createInterface } from 'node:readline';
import { hashPassword } from '../lib/auth/scrypt.mjs';

const MIN_LENGTH = 12;

async function readPassword() {
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks)
      .toString('utf8')
      .replace(/\r?\n$/, '');
  }
  process.stdout.write('Admin jelszó: ');
  const rl = createInterface({ input: process.stdin, terminal: true });
  // Mute the echo while typing.
  /** @type {any} */ (rl)._writeToOutput = () => {};
  const answer = await new Promise((resolve) => rl.question('', resolve));
  rl.close();
  process.stdout.write('\n');
  return String(answer);
}

const password = await readPassword();
if (password.length < MIN_LENGTH) {
  console.error(`A jelszó legalább ${MIN_LENGTH} karakter legyen.`);
  process.exit(1);
}
console.log(await hashPassword(password));
