/**  
 * Remote DB CRUD Interface for a Bixby UserData Structure
 * 
 * In Bixby, the UserData Structure looks like this:
 * {
 *   $id: <dbUserId>
 *   $type: <bixbyConceptType>
 *   <property1>: <bixbyConceptValue1>
 *   <property2>: <bixbyConceptValue2>
 *   ...
 * }
 * 
 * In the remote DB Collection, a UserData Document looks like this:
 * {
 *   _id: <dbUserId>
 *   user-id-field: <bixbyUserId>
 *   user-data-field: {
 *     <property1>: <bixbyConceptValue1>
 *     <property2>: <bixbyConceptValue2>
 *     ...
 *   }
 * }
 * 
 **/
var http = require('http')
var properties = require('./properties.js')

module.exports = {
  deleteUserData: deleteUserData, // DELETE UserData
  getUserData: getUserData,       // READ UserData if exists, otherwise return nothing
  putUserData: putUserData        // UPDATE UserData if exists, otherwise CREATE UserData
}

function createUserData(bixbyUserId, userData) {
  const url = properties.get("config", "base-url") + properties.get("config", "collection")
  const query = {
    apikey: properties.get("secret", "api-key")
  }
  const body = {}
  body[properties.get("config", "user-id-field")] = bixbyUserId
  body[properties.get("config", "user-data-field")] = JSON.stringify(userData)
  const options = {
    format: "json",
    query: query,
    cacheTime: 0
  }
  const response = http.postUrl(url, body, options)
  if (response) {
    userData = response[properties.get("config", "user-data-field")]
    userData.$id = response["_id"]
    return userData
  }
}

function deleteUserData(userData) {
  const dbUserId = userData.$id
  if (dbUserId) {
    // Exists. Delete
    const url = properties.get("config", "base-url") + properties.get("config", "collection") + "/" + dbUserId
    const query = {
      apikey: properties.get("secret", "api-key")
    }
    const options = {
      format: "json",
      query: query,
      cacheTime: 0
    }
    const response = http.deleteUrl(url, {}, options)
    if (response) {
      return true
    } else {
      return false
    }
  } else {
    // Doesn't exist.
    return
  }
}

function getUserData(bixbyUserId) {
  const url = properties.get("config", "base-url") + properties.get("config", "collection")
  const query = {
    apikey: properties.get("secret", "api-key"),
    q: "{\"" + properties.get("config", "user-id-field") + "\":\"" + bixbyUserId + "\"}"
  }
  const options = {
    format: "json",
    query: query,
    cacheTime: 0
  }
  const response = http.getUrl(url, options)
  if (response && response.length === 1) {
    const userData = response[0][properties.get("config", "user-data-field")]
    userData.$id = response[0]["_id"]
    return userData
  } else {
    // Doesn't exist
    return
  }
}

function putUserData(bixbyUserId, userData) {
  const dbUserId = userData.$id
  delete userData.$id
  delete userData.$type
  if (dbUserId) {
    // Already exists. Update
    return updateUserData(bixbyUserId, dbUserId, userData)
  } else {
    // New user. Create
    return createUserData(bixbyUserId, userData)
  }
}

function updateUserData(bixbyUserId, dbUserId, userData) {
  const url = properties.get("config", "base-url") + properties.get("config", "collection") + "/" + dbUserId
  const query = {
    apikey: properties.get("secret", "api-key")
  }
  const body = {}
  body[properties.get("config", "user-id-field")] = bixbyUserId
  body[properties.get("config", "user-data-field")] = JSON.stringify(userData)
  const options = {
    format: "json",
    query: query,
    cacheTime: 0
  }
  const response = http.putUrl(url, body, options)
  if (response) {
    userData = response[properties.get("config", "user-data-field")]
    userData.$id = response["_id"]
    return userData
  }
}
