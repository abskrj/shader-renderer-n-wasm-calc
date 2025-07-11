use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn evaluate_expression(expr: &str) -> Result<f64, JsValue> {
    let mut chars = expr.chars().peekable();
    parse_expression(&mut chars).map_err(|e| JsValue::from_str(&e))
}

fn skip_whitespace(chars: &mut std::iter::Peekable<std::str::Chars>) {
    while let Some(&c) = chars.peek() {
        if c.is_whitespace() {
            chars.next();
        } else {
            break;
        }
    }
}

fn parse_expression(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64, String> {
    skip_whitespace(chars);
    let mut value = parse_term(chars)?;

    loop {
        skip_whitespace(chars);
        match chars.peek() {
            Some(&'+') => {
                chars.next();
                skip_whitespace(chars);
                value += parse_term(chars)?;
            }
            Some(&'-') => {
                chars.next();
                skip_whitespace(chars);
                value -= parse_term(chars)?;
            }
            _ => break,
        }
    }

    Ok(value)
}

fn parse_term(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64, String> {
    skip_whitespace(chars);
    let mut value = parse_factor(chars)?;

    loop {
        skip_whitespace(chars);
        match chars.peek() {
            Some(&'*') => {
                chars.next();
                skip_whitespace(chars);
                value *= parse_factor(chars)?;
            }
            Some(&'/') => {
                chars.next();
                skip_whitespace(chars);
                value /= parse_factor(chars)?;
            }
            _ => break,
        }
    }

    Ok(value)
}

fn parse_factor(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64, String> {
    skip_whitespace(chars);
    match chars.peek() {
        Some(&'(') => {
            chars.next();
            skip_whitespace(chars);
            let value = parse_expression(chars)?;
            skip_whitespace(chars);
            if chars.next() != Some(')') {
                return Err("Missing closing parenthesis".to_string());
            }
            Ok(value)
        }
        Some(c) if c.is_digit(10) || *c == '.' => parse_number(chars),
        _ => Err("Invalid factor".to_string()),
    }
}

fn parse_number(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64, String> {
    skip_whitespace(chars);
    let mut num_str = String::new();
    while let Some(&c) = chars.peek() {
        if c.is_digit(10) || c == '.' {
            num_str.push(c);
            chars.next();
        } else {
            break;
        }
    }
    if num_str.is_empty() {
        return Err("Invalid number".to_string());
    }
    num_str
        .parse::<f64>()
        .map_err(|_| "Invalid number".to_string())
}
