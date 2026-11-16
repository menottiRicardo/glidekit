import pc from 'picocolors';

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export const consoleLogger: Logger = {
  info: (message) => console.log(message),
  success: (message) => console.log(`${pc.green('✔')} ${message}`),
  warn: (message) => console.warn(`${pc.yellow('!')} ${message}`),
  error: (message) => console.error(`${pc.red('✖')} ${message}`),
};

export async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const { createInterface } = await import('node:readline/promises');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`${question} ${pc.dim('(y/N)')} `);
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    rl.close();
  }
}
