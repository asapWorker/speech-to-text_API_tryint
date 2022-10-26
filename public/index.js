document.getElementById("audio").onchange = (event) => {
  const filePath = event.target.value;
  document.getElementById("input-text").innerText = filePath.slice(filePath.lastIndexOf('\\') + 1);
}
document.getElementById("buttons-container").addEventListener('click', handleBtnClick);



function handleBtnClick(event) {
  if (!(event.target.className === "btn-service")) return;
  const serviceName = event.target.name;

  let request = requestToService.bind(null, serviceName);

  const file = document.getElementById("audio").files[0];
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = async () => {
    await showRequestResult(reader.result, request);
    document.getElementById("result-service-name").innerText = event.target.value;
  }
}

async function requestToService(name, data) {
  const response = await fetch("http://localhost:3000/", {
    method: "POST",
    headers: {
      'service-name': `${name}`,
    },
    body: data,
  })
  const result = await response.text();
  return result;
}

async function showRequestResult(data, request) {
  const result = await request(data);
  document.getElementById("result-area").innerText = await result;
}
