module.exports = (newObj, oldObj,key) => {
  if (newObj === oldObj) {
    return true;
  }
  if (typeof newObj !== 'object' || newObj === null ||
      typeof oldObj !== 'object' || oldObj === null) {
    return false;
  }
  for(let i in newObj){
    if(typeof oldObj[i] == "undefined") return false;
    if(newObj[i][key]!=oldObj[i][key]){
      return false;
    }
  }
  return true;
}
