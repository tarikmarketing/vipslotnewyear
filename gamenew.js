// Global state
let isLoggedIn = false;
let gameCount = 1; // Default spin hakkı

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const wisText = document.querySelector('.wis-txt');
  const leverBall = document.getElementById('lever-ball');
  const leverBar = document.getElementById('lever-bar');
  const slotMac1 = document.querySelector('.slot-machine1');
  const slotMac2 = document.querySelector('.slot-machine2');
  const slotMac3 = document.querySelector('.slot-machine3');

  // Sayfa yüklendiğinde önceki kullanıcı adını kontrol et
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    const usernameInput = document.getElementById('username');
    usernameInput.value = savedUsername;
    usernameInput.readOnly = true;
    loginForm.style.display = 'none';
    wisText.innerHTML = `<span class="wis-starter-txt">Hoş geldin ${savedUsername}! Çevirmek için kolu çek!</span>`;
    isLoggedIn = true;
    init();

    // Kullanıcı adı varsa spin hakkını kontrol et
    checkSpinRight(savedUsername.toLowerCase()).then(hasSpinRight => {
      if (!hasSpinRight) {
        alert('Spin hakkınız kalmadı!');
        isLoggedIn = false; // Spin hakkı yoksa login durumunu false yap
      }
    }).catch(error => {
      console.error('Spin hakkı kontrolünde hata:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    });
  }

  // Login form submit handler
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let username = document.getElementById('username').value.trim().toLowerCase();

    // Boşluk kontrolü
    if (username === '' || username.includes(' ')) {
      alert('Kullanıcı adı boş olamaz ve boşluk içeremez!');
      return;
    }

    try {
      const hasSpinRight = await checkSpinRight(username);
      if (hasSpinRight) {
        loginForm.style.display = 'none';
        wisText.innerHTML = `<span class="wis-starter-txt">Hoş geldin ${username}! Çevirmek için kolu çek!</span>`;
        isLoggedIn = true;
        localStorage.setItem('username', username);
        init();
      } else {
        alert('Spin hakkınız yok!');
      }
    } catch (error) {
      console.error('Form submit hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  });

  // Username input için keypress event ekle
  document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === ' ') {
      e.preventDefault();
    }
  });

  // Lever click handler
  leverBall.addEventListener('click', async function() {
    console.log('Login durumu:', isLoggedIn); // Debug için

    if (!isLoggedIn) {
      alert('Lütfen önce kullanıcı adınızı girip Onayla butonuna tıklayın!');
      return;
    }

    const username = document.getElementById('username').value.toLowerCase();
    const hasSpinRight = await checkSpinRight(username);
    if (!hasSpinRight) {
      alert('Spin hakkınız kalmadı!');
      return; // Spin işlemini durdur
    }

    // Spin işlemini başlat
    leverBall.classList.add('downBall');
    leverBar.classList.add('downBar');
    slotMac1.classList.add('animation1');
    slotMac2.classList.add('animation2');
    slotMac3.classList.add('animation3');
    
    // Spin fonksiyonunu çağır
    spin();
  });

  // Ekran boyutu değiştiğinde görselleri güncelle
  window.addEventListener('resize', function() {
    init();
  });
});

async function checkSpinRight(username) {
  try {
    console.log('Checking spin right for:', username);
    
    const response = await fetch(`https://slotcu.vipmobilapp.workers.dev/slotcu?username=${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Spin hakkı kontrolü:', data);
    
    // Handle missing data
    if (!data || typeof data.rewardRight === 'undefined') {
      console.error('Invalid response data:', data);
      return false;
    }

    return data.rewardRight > 0;
    
  } catch (error) {
    console.error('Spin hakkı kontrolünde hata:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    return false;
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    const data = await request.json()
    const { username, rewardRight, reward } = data

    // Veritabanına yazma işlemi burada yapılacak
    const query = `INSERT INTO rewards (username, rewardRight, reward) VALUES (?, ?, ?)`
    const result = await D1.prepare(query).bind(username, rewardRight, reward).run()

    return new Response(JSON.stringify(result), { status: 200 })
  } else {
    return new Response('Method not allowed', { status: 405 })
  }
}

// Global değişkenler
let items = [];
let winRates = [];
let totalWRates = 0;
let spliterC = 0;

// Global login flag ekle

function init() {
  // Mobil kontrol
  const isMobile = window.innerWidth <= 768;
  
  // Görselleri tanımla
  const images = {
    desktop: 'https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/50tlv2.png,30,https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/ucak.png,30,https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/cark.png,10,https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/bigbassxmas.png,30',
    mobile: 'https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/50tlmobile.png,30,https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/ucakmobile.png,30,https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/carkmobile.png,10,https://raw.githubusercontent.com/tarikmarketing/vipslotyilbasi/refs/heads/main/bigbassxmasmobile.png,30'
  };
  
  // Ekran boyutuna göre görsel setini seç
  const oc5 = isMobile ? images.mobile : images.desktop;
  const totalObj = oc5.split(',');

  // Resimleri ve oranları ayır
  for (let index = 0; index < totalObj.length; index++) {
    if (index % 2 == 0) {
      items[spliterC] = totalObj[index];
    } else {
      winRates[spliterC] = totalObj[index];
      spliterC++;
      totalWRates += parseInt(totalObj[index]);
    }
  }

  // Kümülatif oranları hesapla
  for (let index = 0; index < winRates.length; index++) {
    if (index == 0) {
      winRates[index] = parseInt(winRates[index]);
    } else {
      winRates[index] = parseInt(winRates[index - 1]) + parseInt(winRates[index]);
    }
  }

  // Slot makinesi elementlerini oluştur
  const slotMac1 = document.querySelector('.slot-machine1');
  const slotMac2 = document.querySelector('.slot-machine2');
  const slotMac3 = document.querySelector('.slot-machine3');

  // Slot makinesi item'larını ekle
  for (let index = 0; index < items.length; index++) {
    slotMac1.insertAdjacentHTML('beforeend', `
      <li class="slot1_item">
        <img class="image_item" src='${items[index]}' data-symbol-type='${items[index]}'/>
      </li>
    `);
    slotMac2.insertAdjacentHTML('beforeend', `
      <li class="slot2_item">
        <img class="image_item" src='${items[index]}' data-symbol-type='${items[index]}'/>
      </li>
    `);
    slotMac3.insertAdjacentHTML('beforeend', `
      <li class="slot3_item">
        <img class="image_item" src='${items[index]}' data-symbol-type='${items[index]}'/>
      </li>
    `);
  }
}

function slotMachine(){  
  var machine = document.querySelector('.machine');
  var slotMac1 = document.querySelector('.slot-machine1');
  var slotMac2 = document.querySelector('.slot-machine2');
  var slotMac3 = document.querySelector('.slot-machine3');
  var leverBall = document.querySelector('#lever-ball');  
  var leverBar = document.querySelector('#lever-bar');  
  var wisText = document.querySelector('.wis-txt');
  var gameCount = 0;
  var degree1 = '36deg',
      degree2 = '72deg',
      degree3 = '108deg';
  
  var root = document.querySelector(':root');
  var paneSize = 150;
  var xAngle1,
      xAngle2,
      xAngle3;
  
  function compare(value1, operator, value2) {
    switch (operator) {
        case '>':   return value1 > value2;
        case '<':   return value1 < value2;
        case '>=':  return value1 >= value2;
        case '<=':  return value1 <= value2;
        case '==':  return value1 == value2;
        case '!=':  return value1 != value2;
        case '===': return value1 === value2;
        case '!==': return value1 !== value2;
    }
  }
  
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  var rnd = randomInt(0,100);
  
  function slot1Spin(){
    root.style.setProperty('--slot1Rotate',degree1);
    var panes1 = document.querySelectorAll(".slot1_item"),
        zDepth1 = paneSize / (2 * Math.tan(Math.PI/panes1.length));
  
    for (let index = 0; index < panes1.length; index++) {
      xAngle1 = 360 / panes1.length * index;
      panes1[index].style.transform= "rotateX("+ xAngle1 +"deg) translateZ("+ zDepth1 +"px)";
    }
  
    slotMac1.addEventListener('animationend',function(){
      slotMac1.style.transform = 'rotateX('+degree1+')';
      slotMac1.classList.remove('animation1');
    });
  }
  
  function slot2Spin(){
    root.style.setProperty('--slot2Rotate',degree2);
    var panes2 = document.querySelectorAll('.slot2_item'),
        zDepth2 = paneSize / (2*Math.tan(Math.PI/panes2.length));
  
    for (let i =0;i<panes2.length;i++){
      xAngle2 = 360 / panes2.length * i;
      panes2[i].style.transform = "rotateX("+xAngle2+"deg) translateZ("+zDepth2+"px)";
    }
    slotMac2.addEventListener('animationend',function(){
      slotMac2.style.transform = 'rotateX('+degree2+')';
      slotMac2.classList.remove('animation2');
    });
  }
  
  function slot3Spin() {
    root.style.setProperty('--slot3Rotate', degree3);
    var panes3 = document.querySelectorAll('.slot3_item'),
        zDepth3 = paneSize / (2 * Math.tan(Math.PI / panes3.length));
  
    for (let j = 0; j < panes3.length; j++) {
      xAngle3 = 360 / panes3.length * j;
      panes3[j].style.transform = "rotateX(" + xAngle3 + "deg) translateZ(" + zDepth3 + "px)";
    }
  
    slotMac3.addEventListener('animationend', function () {
      slotMac3.style.transform = 'rotateX(' + degree3 + ')';
      leverBall.classList.remove('downBall');
      leverBar.classList.remove('downBar');
      slotMac3.classList.remove('animation3');
  
      // Bu noktada sembolü boundingRect ile bulmak yerine chosenIndex'i kullanıyoruz.
      setTimeout(() => {
        const spinMessageModal = document.querySelector('.spin-message-modal');
        const imageUrl = items[window.currentWinnerIndex]; // Kazanan sembolün URL'si
  
        const symbols = {
          'cark.png': 'VIP ÇARKTA GEÇERLİ KOD KAZANDINIZ!',
          'ucak.png': 'BIG BASS XMAS OYUNUNDA GEÇERLİ 50 FREE SPIN KAZANDINIZ!',
          '50tlv2.png': 'HER ALANDA GEÇERLİ 50 TL KAZANDINIZ!',
          'bigbassxmas.png': 'VIPPARX OYUNUNDA GEÇERLİ 50 TL KAZANDINIZ!'
        };
  
        const fileName = imageUrl.split('/').pop().toLowerCase();
        console.log('Seçilen dosya:', fileName); // Debug için
  
        let messageToShow = '';
        let reward = '';
        for (let symbol in symbols) {
          console.log('Karşılaştırılan:', symbol, fileName); // Debug için
          if (fileName.includes(symbol)) {
            messageToShow = symbols[symbol];
            reward = messageToShow;
            console.log('Eşleşme bulundu:', messageToShow); // Debug için
            break;
          }
        }
  
        // Mesaj modalını güncelle ve görünür yap
        spinMessageModal.style.display = 'block';
        spinMessageModal.innerHTML = `
          <div class="spin-message-text">TEBRİKLER!</div>
          <div class="spin-message-text">${messageToShow}</div>
          <div class="spin-message-text">ÖDÜLÜNÜZ 24 SAAT İÇERİSİNDE HESABINIZA EKLENECEKTİR.</div>
        `;
  
        // Kullanıcı adı ve ödül hakkı bilgilerini burada belirleyin
        const username = document.getElementById('username').value; // Kullanıcı adını formdan alıyoruz
        const rewardRight = gameCount; // Spin hakkı olarak gameCount değerini kullanıyoruz
  
        // Veritabanına yazma işlemi
        fetch('https://slotcu.vipmobilapp.workers.dev/slotcu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
                      },
          body: JSON.stringify({
            username: username,
            rewardRight: rewardRight,
            reward: reward
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Veritabanına yazma işlemi başarılı:', data);
        })
        .catch(error => {
          console.error('Veritabanına yazma işlemi sırasında hata oluştu:', error);
        });
      }, 1000);
    });
  }
  
  function spin() {
    var perByItem = 360 / items.length;
    var winnerVal = 0;
    let chosenIndex = null;

    // Debug için ekliyoruz
    console.log('Random değer (rnd):', rnd);
    console.log('Kazanma oranları:', winRates);
    console.log('Toplam oran:', totalWRates);

    for(let index = 0; index < items.length; index++) {
      if(index == 0) {
        if(compare(rnd,'<=',winRates[index])) {
          winnerVal = perByItem * index;
          degree1 = (360 + winnerVal)+'deg';
          degree2 = (360 + winnerVal)+'deg';
          degree3 = (360 + winnerVal)+'deg';
          chosenIndex = index;
          console.log('Seçilen index:', index, 'Item:', items[index]); // Debug
        }
      } else {
        if(compare(rnd,'>',winRates[index-1]) && compare(rnd,'<=',winRates[index])) {
          winnerVal = perByItem * index;
          degree1 = (360 + winnerVal)+'deg';
          degree2 = (360 + winnerVal)+'deg';
          degree3 = (360 + winnerVal)+'deg';
          chosenIndex = index;
          console.log('Seçilen index:', index, 'Item:', items[index]); // Debug
        }
      }
    }

    if(chosenIndex === null && compare(rnd,'>',winRates[items.length-1]) && compare(rnd,'<=',100)) {
      // Kaybetme durumunda rastgele bir item
      chosenIndex = randomInt(0, items.length - 1);
      winnerVal = perByItem * chosenIndex;
      degree1 = (360 + winnerVal)+'deg';
      degree2 = (360 + winnerVal)+'deg';
      degree3 = (360 + winnerVal)+'deg';
    }

    // Kazanan indeksi global sakla
    window.currentWinnerIndex = chosenIndex;

    slot1Spin();
    slot2Spin();
    slot3Spin();
  }  

  function checkWinner() {
    var firstSlot = slotMac1.getBoundingClientRect(),
        secondSlot = slotMac2.getBoundingClientRect(),
        lastSlot = slotMac3.getBoundingClientRect(),
        loserModal = document.querySelector('.loser-modal'),
        winnerModal = document.querySelector('.winner-modal'),

        r1 = document.elementFromPoint(firstSlot.x+(firstSlot.width/2),firstSlot.y+(firstSlot.height/2+10)),
        r2 = document.elementFromPoint(secondSlot.x+(secondSlot.width/2),secondSlot.y+(secondSlot.height/2+10)),
        r3 = document.elementFromPoint(lastSlot.x+(lastSlot.width/2),lastSlot.y+(lastSlot.height/2+10));
    
    setTimeout(() => {
      // BURADA spinMessageModal'a dokunmuyoruz!
      
      // Kazanma durumunu burada textContent ile kontrol etmek yerine dilerseniz chosenIndex'e göre de kontrol edebilirsiniz.
      // Ancak mevcut mantığı koruyalım:
      if (r1 && r2 && r3 && 
          r1.parentElement.textContent == r2.parentElement.textContent && 
          r1.parentElement.textContent == r3.parentElement.textContent && 
          rnd <= totalWRates) {
        winnerModal.innerHTML = `
          <div class="modal-title">TEBRİKLER!</div>
        `;
        winnerModal.style.display = 'flex';
      } else {
        loserModal.innerHTML = `
          <div class="modal-title">TEBRİKLER!</div>
        `;
        loserModal.style.display = 'flex';
        if(gameCount > 0){
          gameCount--;
          againBtn.addEventListener('click', function () {
            rnd = randomInt(0, 100);
            loserModal.style.display = 'none';
            slotMac1.style = '';
            slotMac2.style = '';
            slotMac3.style = '';
            spin();
            wisText.innerHTML = "<span class='wis-starter-txt'>Kalan hakkın: "+gameCount+"</span>";
          });
        } else {
          againBtn.textContent = '';
          againBtn.disabled = true;
        }
      }
    }, 400);
  }

  init();
  spin();

  // leverBall click event listener'ını güncelle
  leverBall.addEventListener('click', function() {
    if (!isLoggedIn) {
        return;
    }

    // Login yapılmışsa normal işleme devam et
    leverBall.classList.add('downBall');
    leverBar.classList.add('downBar');
    slotMac1.classList.add('animation1');
    slotMac2.classList.add('animation2');
    slotMac3.classList.add('animation3');
  });

  // Ekran boyutu değiştiğinde görselleri güncelle
  window.addEventListener('resize', function() {
      init();
  });
}
slotMachine();

// Login form submit handler'ını güncelle
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    if (username.trim() !== '') {
        // Input'u readonly yap (hem desktop hem mobil için)
        document.getElementById('username').readOnly = true;
        
        // Kullanıcı adını sakla
        localStorage.setItem('username', username);
        
        // Login flag'i güncelle
        isLoggedIn = true;
        
        // Form container'ı gizle
        document.querySelector('.login-container').style.display = 'none';
        
        // Slot makinesini başlat
        init();
    }
}

// Sayfa yüklendiğinde önceki kullanıcı adını kontrol et
document.addEventListener('DOMContentLoaded', function() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        const usernameInput = document.getElementById('username');
        usernameInput.value = savedUsername;
        usernameInput.readOnly = true;
    }
});
