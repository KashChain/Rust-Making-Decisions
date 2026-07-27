use std::io;

fn main() {
    let mut name = String::new();

    println!("Enter wallet owner:?");


    io::stdin()
        .read_line(&mut name)
        .expect("Failed to read input");

    println!("Wallet created for {}!", name.trim());
}