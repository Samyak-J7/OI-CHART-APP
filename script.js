const getdata=async () => {
    let response = await fetch(`api/${scr}`);
    let data = await response.json();
    main_data=data;
    removeOptions(exp);
    set_exp_scr(data);
    makegraph(data,exp.options[0].value);
} 
function set_exp_scr(dt){
      let exp_arr=new Set();    
      dt.forEach(element => {
        if (!(exp_arr.has(element['expiry'])) ){
          exp_arr.add(element['expiry'])
        }
      });
      if(exp_arr.size>0){
        exp_arr.forEach(element => {
          let expval=document.createElement("option")
          expval.value=element;
          expval.text=element; 
          exp.add(expval) 

        });
      }
}
function reverseWords(str) {
  const words = str.split(' ');
  const reversedWords = words.reverse();
  const reversedString = reversedWords.join(' ');  
  return reversedString;
}
  function makegraph(jsonDataArray,targetExpiry){
      try{
      let filteredDataArray = jsonDataArray.filter(obj => obj.expiry === targetExpiry);
      filteredDataArray.sort(function(a, b) {
        return b.striq - a.striq; 
    });
      let labels = filteredDataArray.map(obj => obj.striq);
      let lot_size;
      switch (scr) {
        case "NIFTY":lot_size=50; break;
        case "BANKNIFTY":lot_size=15; break;
        case "FINNIFTY":lot_size=40; break;      
        default:
          break;
      }
      
      
      let ts=reverseWords(filteredDataArray[0]['ts']);
      let cmp=filteredDataArray[0]['underlying'];
     
      labels=labels.toString();
      let container = document.getElementById('chart');    
      let canvasHeight = Math.max(labels.length * 40, 400); // Adjust the multiplier as needed
      let maxHeight = 800;
      container.style.height = Math.min(canvasHeight, maxHeight) + 'px';
      let charr = [['Strike', 'Call OI',{type:'string',role:'tooltip',fontName:'monospaced','p': {'html': true}},'Put OI',{type:'string',role:'tooltip','p': {'html': true}}]];
      
      let rows = filteredDataArray.map(obj => [obj.striq.toString(), obj.call_oi,oi_hist(obj.week,obj.striq), obj.put_oi,oi_hist(obj.week,obj.striq)]);
      rows.forEach(element => {
      
        if (dlimit(element[0],cmp, 3)===true)
						{
        charr.push(element);  }
      });
        
      const options = {
        
        chartArea:{
            top: 100,
            bottom: 100, 
            left:100
        },
        backgroundColor: '#dcdedd',
        legend: { position: 'top', alignment: 'start' },
        title:`CMP: ${cmp} at ${ts}`,  
        series: {
          0: {color: 'red'}, // Color for first bar
          1: {color: 'green'}   // Color for second bar
        },
        vAxis: {
          title: 'Strikes',
          gridlines: {
              color: 'transparent'
          }
      },
      hAxis: {
        title: 'OpenContracts',
          gridlines: {
              color: 'transparent'
          }
      } ,tooltip: { isHtml: true  },
      crosshair:{trigger:'focus'}
      
      }
      
      data2=google.visualization.arrayToDataTable(charr);           
      const chart = new google.visualization.BarChart(document.getElementById('chart'));  
      

      function oi_hist(wkd,strk)
		{
  
			let rst = "<h1><b><u>"+ strk +"</h1></u></b>";
			rst += "<table >";
			rst += "<th>Day</th><th>Call OI</th><th>Rs</th><th>Put OI</th><th>Rs</th><th>CM</th><th>PM</th><th>PCR</th>"; 
      const keys=Object.keys(wkd);
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let keys_iter=[];
      const d=new Date;
      let day = d.getDay();
      for(let i=day+1;i<6;i++){
          keys_iter.push(daysOfWeek[i]);
      } 
      for(let i=1;i<=day;i++){
        keys_iter.push(daysOfWeek[i]);
    } 
      const rem_keys=keys.slice(5);
      keys_iter.push(...rem_keys);
      for( wkd_val of keys_iter){
    
          rst +="<tr>"
          rst +=`
                <td> ${wkd_val} </td>
                <td> ${wkd[wkd_val]['call_oi']} </td>
                <td>  ₹${Math.floor(wkd[wkd_val]['call_rs']) } </td>
                <td> ${wkd[wkd_val]['put_oi']} </td>
                <td>  ₹${Math.floor(wkd[wkd_val]['put_rs']) } </td>
                <td> ${(lot_size*(wkd[wkd_val]['call_oi']*wkd[wkd_val]['call_rs']/10000000)).toFixed(1)} </td>
                <td> ${(lot_size*(wkd[wkd_val]['put_oi']*wkd[wkd_val]['put_rs']/10000000)).toFixed(1)}</td>
                <td> ${(wkd[wkd_val]['put_oi']/wkd[wkd_val]['call_oi']).toFixed(1)}x </td>`
          rst +="</tr>"
      }
     
			return rst;
		}	
                 
    
        chart.draw(data2, options);}
        catch{
          getdata();
        }
      
    }


    function removeOptions(selectElement) {
      let i, L = selectElement.options.length - 1;
      for(i = L; i >= 0; i--) {
         selectElement.remove(i);
      }
   }
   function dlimit(strq,fig,pct)
		{
			if (strq<=(fig*(100+pct)/100) && strq>=(fig*(100-pct)/100))
			{	return true;}
			else
			{	return false;}
		}

let main_data;
let optionsChart;
let exp=document.querySelector("#expiry")
let scrip=document.querySelector("#scr");
let scr=scrip.value;
exp.addEventListener('change',(event) => {
  makegraph(main_data,event.target.value);
})

scrip.addEventListener('change',(event) => {
  scr=scrip.value;
 
  getdata();
})
google.charts.load('current', {'packages':['corechart']});
 $(window).resize(function(){
   makegraph(main_data,exp.value);
   });
getdata();