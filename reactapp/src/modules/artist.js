
export default function(image){
  let chars = image.substring(0,2);
  if(chars=="aw"){
    return "Adam Whitlock"
  }else if(chars=="ad"){
    return "Andrew Desforges"
  }else if(chars=="ag"){
    return "Austin Griffith"
  }
  return "Unknown"
}
