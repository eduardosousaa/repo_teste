
String.prototype.reverse = function(){
    return this.split('').reverse().join('');
};

export default function MaskTelefone(e) {
    if (e.target.value.length > 15) {
        e.target.value = e.target.value.replaceAll(/.$/gi, "");
        return
    }
    let valor = e.target.value.replace(/[^\d]+/gi, '').reverse();
    let resultado = "";
    let mascara;
    let tipo2 = false;
    let valorSemMask = e.target.value.replace(/-|[(]|[)]| /g, "");
    
    if((valorSemMask[0] == "0" && valorSemMask[2] == "0" && valorSemMask[3] == "0") || 
       (valorSemMask[0] == "4" && valorSemMask[1] == "0" && valorSemMask[2] == "0") ||
       (valorSemMask[0] == "3" && valorSemMask[1] == "0" && valorSemMask[2] == "0")) {
        tipo2 = true;
        mascara = "####-###-####".reverse();
    }else{
        if(e.target.value.length <= 14){ 
            mascara = "(##) ####-####".reverse();}
        else{
            mascara = "(##) #####-####".reverse();}
    }

    for (let x = 0, y = 0; x < mascara.length && y < valor.length;) {
        if (mascara.charAt(x) != '#') {
            resultado += mascara.charAt(x);
            x++;
        } else {
            resultado += valor.charAt(y);
            y++;
            x++;
        }

        if(!tipo2){
          if(e.target.value.length <= 14){
              if(valor.length == 10 && y == 10){
                  resultado += mascara.charAt(x);
              }
          }else{
              if(valor.length == 11 && y == 11){
                  resultado += mascara.charAt(x);
              }
          }
        }

    }
    e.target.value = resultado.reverse();
}
