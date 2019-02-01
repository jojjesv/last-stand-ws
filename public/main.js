let retryTimeoutId

function initWs(username) {
  document.body.classList.add('busy')

  let ws = new WebSocket(
    "ws://192.168.0.7:8086/?username=" + encodeURIComponent(username)
  )

  ws.onopen = function() {
    document.getElementById('instructions').innerText = "Click and become dominant!"
    document.getElementById('input-username').setAttribute('disabled', 'true')
    document.body.classList.remove('busy')

    document.body.addEventListener('click', function(e) {
      let x = e.clientX, y = e.clientY;
      createRipple(x, y)
      ws.send(JSON.stringify({ intent: 'click', x, y }))
    })
  }

  ws.onclose = function() {
    console.log("Retrying...")
    document.getElementById('instructions').innerText = "Reconnecting..."

    clearTimeout(retryTimeoutId)
    retryTimeoutId = setTimeout(() => initWs(username), 2500);
  }

  ws.onmessage = function(data) {
    let d = data.data
    if (typeof d == "string") {
      d = JSON.parse(d)
    }

    switch (d.type) {
      case 'latest':
      let { username, color, x, y, date: dateStr, imageUrl } = d;

      let date = new Date(dateStr);
      
      document.body.style.background = color
      document.getElementById('instructions').innerHTML = username ? (
        username + " is dominant<br/>since "
        + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds())
      ) : "nobody is dominant!"

      console.log("IMAGEURL", imageUrl)
      
      if (typeof x == "number" && typeof y == "number") {
        createRipple(x, y, imageUrl)
      }

      break;
    }
  }
}

window.onload = function() {
  document.getElementById('input-username').addEventListener('keyup', function(e) {
    if (e.keyCode == 13) {
      let username = e.target.value
      if (username.length > 2) {
        initWs(username)
      }
    }
  })
}

function createRipple(x, y, imageUrl = null) {
  let e = document.createElement('div')
  e.classList.add('ripple')
  e.style.top = y + "px"
  e.style.left = x + "px"

  if (imageUrl) {
    e.style.backgroundImage = "url(" + imageUrl + ")"
  }

  setTimeout(() => {
    e.remove()
  }, 1500)

  document.body.appendChild(e)
}

function pad(x) {
  if (typeof x != "string") {
    x = x.toString();
  }

  return x.length < 2 ? "0" + x : x;
}