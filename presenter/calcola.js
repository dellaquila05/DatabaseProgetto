export const calcolaDistanza = (p1, p2) => {
  console.log("distanza",p1,p2)
  let cateto1 = p1[0] - p2[0];
  let cateto2 = p1[1] - p2[1];
  let dist = Math.sqrt(cateto1 ** 2 + cateto2 ** 2);
  return dist;
}