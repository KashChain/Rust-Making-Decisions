fn main() {
    let balance= 750;

    if balance < 100 {
        println!("New User");
    } else if balance <= 100 && balance <= 499 {
            println!("Active User");
           }   else if balance >=500 && balance <=999 {
            println!("Power User");
           } else {
            println!("Whale");
           }
        }
    
