const Tables= [];
let HTML = undefined;
const loading = `
<div class="circle" id="C1"></div>
<div class="circle" id="C2"></div>
<div class="circle" id="C3"></div>
<div class="circle" id="C4"></div>
<div class="circle" id="C5"></div>
`
function format(num) {

return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function numberToTime(x) {
  let xCeil = Math.ceil(x);
  let result = "";
  if (xCeil>=365) result += Math.floor(xCeil/365) + (Math.floor(xCeil/365)>1 ? " years " : " year ");
  if (Math.floor((xCeil%365)/30) != 0) result += Math.floor((xCeil%365)/30) + (Math.floor((xCeil%365)/30) > 1 ? " months " : " month ");
  if (Math.floor((xCeil%365)%30) != 0) result += Math.floor((xCeil%365)%30) + (Math.floor((xCeil%365)%30) > 1 ? " days" : " day");
  return result;
}


async function scrapeData(link) {
    try {
        let load = document.createElement("div");
        load.className = "circleContainer"
        load.innerHTML = loading;
        document.body.appendChild(load);
        const response = await fetch("https://api.allorigins.win/raw?url=" + link);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        HTML = doc;
        const timeStamps = doc.getElementsByClassName("text-right");
        const chapCount = Number(doc.getElementsByClassName("label label-default pull-right")[0].textContent.match(/\d+/)[0])
        const title = doc.querySelector('h1').textContent;
        const author = doc.querySelector("h4").innerText
        const wordCount = doc.getElementsByClassName("fal fa-question-circle popovers")[0].dataset.content.match(/[\d,]+(?=\swords\.)/)[0].replace(/\,/g, "");
        const firstDate = timeStamps[1].children[0].children[0];
        const firstUnix = Date.parse(firstDate.dateTime);
        const lastDate = timeStamps[timeStamps.length - 2].children[0].children[0];
        const lastUnix = Date.parse(lastDate.dateTime);
        let days = Math.abs((lastUnix - firstUnix)/(1000*60*60*24));
        let WpD = Math.round(wordCount/days);
        let WpC = Math.round(wordCount/chapCount);
        let CpW = Math.round((chapCount/days)*7);

        let table = document.createElement("div");
        table.className = "main";
table.innerHTML = `
<table>
<tbody>
<tr>
<th colspan="2"> Book Title </th>
</tr>
<tr>
<td colspan="2" style="text-align:center;"><a href=${link}>${title}</a> <em><strong>${author}</strong></em></td>
</tr>
<tr>
<th>Word Count:</th>
<td>${format(wordCount)}</td>
</tr>
<tr>
<th>Chapter Count:</th>
<td>${chapCount}</td>
</tr>
<tr>
<th>First Chapter Date:</th>
<td>${firstDate.title}</td>
</tr>
<tr>
<th>Last Chapter Date:</th>
<td>${lastDate.title}</td>
</tr>
<tr>
<th>Time Between:</th>
<td>${Math.floor(days)} ${Math.floor(days)>1 ? "days" : "day"} ${ days > 30 ? "(~" +numberToTime(days)+ "\)" : ""}</td>
</tr>
<tr>
<th>Avg. Words per Chapter:</th>
<td>${format(WpC)}</td>
</tr>
<tr>
<th>Avg. Words per Day:</th>
<td>${format(WpD)}</td>
</tr>
<th>Avg. Chapters per Week:</th>
<td>${format(CpW)}</td>
</tr>
</tbody>
</table>
<button onclick="this.parentElement.remove()">Remove Table</button>
`;
Tables.push(table);
let elem = document.createElement("div")
elem.innerHTML = table.outerHTML;
load.remove();
document.body.appendChild(elem)

    } catch (error) {
        console.log(error);
    }
}
function getData() {
scrapeData(document.querySelector("input").value);
}
