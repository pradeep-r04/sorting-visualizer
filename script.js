let array = [];
let audioCtx = null;

const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const container = document.getElementById("container");

init();

function init(){
    array = [];
    const n = sizeSlider.value;
    for(let i=0; i<n; i++){
        array.push(Math.random());
    }
    showBars();
}

sizeSlider.addEventListener("input", init);

function playNote(freq){
    if(audioCtx == null){
        audioCtx = new (AudioContext || webkitAudioContext)();
    }
    const dur = 0.08;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);

    const node = audioCtx.createGain();
    node.gain.value = 0.1;
    node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);

    osc.connect(node);
    node.connect(audioCtx.destination);
}

const algoSelect = document.getElementById("algoSelect");
const complexityInfo = document.getElementById("complexityInfo");

algoSelect.addEventListener("change", updateComplexity);

function play(){
    const copy = [...array];
    let moves = [];

    switch(algoSelect.value){
        case "bubble":
            moves = bubbleSort(copy);
            break;
        case "insertion":
            moves = insertionSort(copy);
            break;
        case "selection":
            moves = selectionSort(copy);
            break;
        case "quick":
            moves = quickSort(copy);
            break;
        case "merge":
            moves = mergeSort(copy);
            break;
    }

    animate(moves);
}

function animate(moves){
    if(moves.length === 0){
        showBars();
        return;
    }

    const move = moves.shift();
    const [i,j] = move.indices;

    if(move.type === "swap"){
        [array[i], array[j]] = [array[j], array[i]];
    }

    playNote(200 + array[i]*500);

    showBars(move);

    setTimeout(() => {
        animate(moves);
    }, 210 - speedSlider.value);
}

function bubbleSort(arr){
    const moves = [];
    do{
        var swapped = false;
        for(let i=1; i<arr.length; i++){
            moves.push({indices:[i-1,i], type:"comp"});
            if(arr[i-1] > arr[i]){
                swapped = true;
                moves.push({indices:[i-1,i], type:"swap"});
                [arr[i-1], arr[i]] = [arr[i], arr[i-1]];
            }
        }
    } while(swapped);

    return moves;
}

function showBars(move){
    container.innerHTML = "";
    for(let i=0; i<array.length; i++){
        const bar = document.createElement("div");
        bar.style.height = array[i]*100 + "%";
        bar.classList.add("bar");

        if(move && move.indices.includes(i)){
            bar.style.backgroundColor =
                move.type === "swap" ? "#ef4444" : "#facc15";
        }

        container.appendChild(bar);
    }
}

// Complexity
function updateComplexity(){
    const algo = algoSelect.value;

    const complexities = {
        bubble: "Best: O(n) | Avg: O(n²) | Worst: O(n²)",
        insertion: "Best: O(n) | Avg: O(n²) | Worst: O(n²)",
        selection: "Best: O(n²) | Avg: O(n²) | Worst: O(n²)",
        quick: "Best: O(n log n) | Avg: O(n log n) | Worst: O(n²)",
        merge: "Best: O(n log n) | Avg: O(n log n) | Worst: O(n log n)"
    };

    complexityInfo.innerText = complexities[algo];
}

updateComplexity();

// Insertion Sort
function insertionSort(arr){
    const moves = [];

    for(let i=1; i<arr.length; i++){
        let j = i;
        while(j > 0 && arr[j-1] > arr[j]){
            moves.push({indices:[j-1,j], type:"swap"});
            [arr[j-1], arr[j]] = [arr[j], arr[j-1]];
            j--;
        }
    }

    return moves;
}

// Selection Sort
function selectionSort(arr){
    const moves = [];

    for(let i=0; i<arr.length; i++){
        let min = i;
        for(let j=i+1; j<arr.length; j++){
            moves.push({indices:[min,j], type:"comp"});
            if(arr[j] < arr[min]){
                min = j;
            }
        }
        if(min !== i){
            moves.push({indices:[i,min], type:"swap"});
            [arr[i], arr[min]] = [arr[min], arr[i]];
        }
    }

    return moves;
}

// Quick Sort(Recursive)
function quickSort(arr){
    const moves = [];

    function qs(start, end){
        if(start >= end) return;

        let pivot = arr[end];
        let i = start;

        for(let j=start; j<end; j++){
            moves.push({indices:[j,end], type:"comp"});
            if(arr[j] < pivot){
                moves.push({indices:[i,j], type:"swap"});
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
            }
        }

        moves.push({indices:[i,end], type:"swap"});
        [arr[i], arr[end]] = [arr[end], arr[i]];

        qs(start, i-1);
        qs(i+1, end);
    }

    qs(0, arr.length-1);
    return moves;
}

// Merge Sort
function mergeSort(arr){
    const moves = [];

    function merge(left, right, start){
        let result = [], i=0, j=0;

        while(i<left.length && j<right.length){
            if(left[i] < right[j]){
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    function ms(start, end){
        if(end-start <= 1) return arr.slice(start,end);

        let mid = Math.floor((start+end)/2);
        let left = ms(start, mid);
        let right = ms(mid, end);

        let merged = merge(left,right,start);

        for(let i=0;i<merged.length;i++){
            moves.push({indices:[start+i,start+i], type:"swap"});
            arr[start+i] = merged[i];
        }

        return merged;
    }

    ms(0, arr.length);
    return moves;
}