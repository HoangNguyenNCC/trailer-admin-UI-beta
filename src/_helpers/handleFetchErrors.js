export async function handleFetchErrors(response) {
  console.log("handleErrors", response.status);
  if (response.status !== 200) {
    if (response.status === 404) {
      throw Error("Path Not Found");
    }
    response = await response.json();
    console.log(response);

    throw Error(response.message);
  }
  return response;
}
