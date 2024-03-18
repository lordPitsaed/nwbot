export const sortObj = (obj: { [x: string]: number }) => {
  let sortable: [string, number][] = [];
  for (const user in obj) {
    sortable.push([user, obj[user]]);
  }

  const sorted = sortable.sort((a, b) => b[1] - a[1]);
  const sortedObj: { [x: string]: number } = {};

  sorted.forEach((el) => (sortedObj[el[0]] = el[1]));

  return sortedObj;
};
