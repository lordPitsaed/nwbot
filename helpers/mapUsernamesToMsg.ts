export const mapUsernamesToMsg = (usernames: string[]) => {
  return usernames.reduce((acc, usr) => (acc += `@${usr} `), '');
};