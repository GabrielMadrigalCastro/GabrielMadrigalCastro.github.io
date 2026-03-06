const out = document.getElementById("output")
const input = document.getElementById("input")

function print(text=""){
    out.innerText += text + "\n"
    out.scrollTop = out.scrollHeight
}

function rand(n){
    return Math.floor(Math.random()*n)
}

let year=0
let population=95
let acres=1000
let grain=2800
let harvestYield=3
let immigrants=5
let plague=0
let landPrice=20
let starved=0
let totalStarved=0
let avgStarved=0
let planted=0
let eatenByRats=200
let step="buy"

print("HAMURABI")
print("CREATIVE COMPUTING MORRISTOWN, NEW JERSEY")
print("")
print("TRY YOUR HAND AT GOVERNING ANCIENT SUMERIA")
print("FOR A TEN YEAR TERM OF OFFICE.")
print("")

nextYear()

function nextYear(){

year++

if(year>10){
    endGame()
    return
}

if(plague){
population=Math.floor(population/2)
print("A HORRIBLE PLAGUE STRUCK! HALF THE PEOPLE DIED.")
}

population+=immigrants

print("")
print("HAMURABI: I BEG TO REPORT TO YOU")
print(`IN YEAR ${year}`)
print(`${starved} PEOPLE STARVED.`)
print(`${immigrants} CAME TO THE CITY.`)
print(`POPULATION IS NOW ${population}`)
print(`THE CITY NOW OWNS ${acres} ACRES`)
print(`YOU HARVESTED ${harvestYield} BUSHELS PER ACRE`)
print(`RATS ATE ${eatenByRats} BUSHELS`)
print(`YOU NOW HAVE ${grain} BUSHELS IN STORE`)
print("")

landPrice = rand(10)+17
print(`LAND IS TRADING AT ${landPrice} BUSHELS PER ACRE`)
print("HOW MANY ACRES DO YOU WISH TO BUY?")

step="buy"
}

input.addEventListener("keydown",function(e){

if(e.key!=="Enter") return

let value=parseInt(input.value)||0
input.value=""

if(step==="buy"){

if(value*landPrice>grain){
print("YOU DON'T HAVE THAT MUCH GRAIN.")
return
}

acres+=value
grain-=value*landPrice

print("HOW MANY BUSHELS DO YOU WISH TO FEED YOUR PEOPLE?")
step="feed"
}

else if(step==="feed"){

if(value>grain){
print("YOU DON'T HAVE THAT MUCH GRAIN.")
return
}

grain-=value
let fed=Math.floor(value/20)
starved=Math.max(population-fed,0)

if(starved>0.45*population){
print("YOU STARVED TOO MANY PEOPLE.")
endGame()
return
}

population-=starved
totalStarved+=starved

print("HOW MANY ACRES DO YOU WISH TO PLANT?")
step="plant"
}

else if(step==="plant"){

if(value>acres){
print("YOU DON'T OWN THAT MUCH LAND.")
return
}

if(value/2>grain){
print("NOT ENOUGH GRAIN FOR SEED.")
return
}

if(value>population*10){
print("NOT ENOUGH PEOPLE TO TEND THE FIELDS.")
return
}

planted=value
grain-=Math.floor(value/2)

harvestYield=rand(5)+1
let harvest=planted*harvestYield

eatenByRats=0
if(rand(2)==0){
eatenByRats=Math.floor(grain/(rand(5)+1))
}

grain=grain-eatenByRats+harvest

immigrants=Math.floor((rand(5)*(20*acres+grain)/population/100)+1)

plague=(Math.random()<0.15)

nextYear()
}

})

function endGame(){

print("")
print("YOUR TEN YEAR RULE HAS ENDED.")
print(`TOTAL STARVED: ${totalStarved}`)
print(`FINAL POPULATION: ${population}`)
print(`ACRES OWNED: ${acres}`)
print("")
print("SO LONG FOR NOW.")

input.disabled=true
}
