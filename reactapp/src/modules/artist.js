
export default function(image){
  let chars = image.substring(0,2);
  if(chars=="aw"){
    return "Adam Whitlock"
  }else if(chars=="ad"){
    return "Andrew Desforges"
  }else if(chars=="ag"){
    return "Austin Griffith"
  }else if(chars=="wg"){
    return "Randy O"
  }else if(chars=="ts"){
    return "thestarflyer"
  }else if(chars=="jb"){
    return "jbdoge"
  }


  return "Unknown"
}
