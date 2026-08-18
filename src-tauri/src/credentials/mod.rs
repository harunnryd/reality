use keyring::Entry;

const SERVICE: &str = "com.reality.assistant";

#[derive(Debug, thiserror::Error)]
pub enum CredentialsError {
    #[error("keychain error: {0}")]
    Keyring(#[from] keyring::Error),
}

pub fn store_api_key(provider: &str, key: &str) -> Result<(), CredentialsError> {
    let entry = Entry::new(SERVICE, provider)?;
    entry.set_password(key)?;
    Ok(())
}

pub fn get_api_key(provider: &str) -> Option<String> {
    let entry = Entry::new(SERVICE, provider).ok()?;
    entry.get_password().ok()
}

pub fn delete_api_key(provider: &str) -> Result<(), CredentialsError> {
    let entry = Entry::new(SERVICE, provider)?;
    match entry.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.into()),
    }
}

pub fn has_api_key(provider: &str) -> bool {
    get_api_key(provider).is_some()
}
