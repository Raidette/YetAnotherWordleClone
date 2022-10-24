
const LONGUEUR = getWordLength();

const FIRST_LETTER = getFirstLetter();

let nombreTentatives = 0;

var lengthCheck = setInterval(checkForWordChange, 10000);

$("#inputMot").prop("pattern",".{"+LONGUEUR+"}")

$("#inputMot").prop("title","Le mot doit être long de "+LONGUEUR+" caractères.")

$("#nombreCaracteres").text(LONGUEUR);

$("#premiereLettre").text(FIRST_LETTER);

$("#formMot").on("submit", function(){


    event.preventDefault();

    var mot = $('#inputMot').val();

    $.ajax({
        url:'https://nique.freeboxos.fr/ajax-validate-word',
        type:'POST',
        jsonp:"callback",
        dataType:'jsonp',
        data: {
            mot:mot,
        },
        success: async function(res){

            //console.log(res)

            console.log(res.result)

            $("#inputMot").val(""); // Vide le textfield et remet l'initiale

            if(res.result === "notFound")
            {
                console.log("erreur")

                $("#affichageErreur").html(`
                <div class='error col-md-6 col-sm-8 mt-4 mb-2 d-flex flex-column align-items-center text-center' id='divErreur'>
                    <p class="fs-4 text-warning mt-2 mb-2 mx-4 fw-light">Ce mot n'est pas dans la liste :/</p>
                </div>
                `);

                let wait = await(setTimeout(function(){$("#affichageErreur").empty();},7000))
            }

            else
            {
                affichageResultats(LONGUEUR,mot,res.result)

                console.log(nombreTentatives)
    
                if(res.result === "success")
                {
                    $("#tentative:last-child").addClass("success");

                    await(setTimeout(function(){

                        $("#btnValider").text("Bravo !").removeClass("btn-primary").addClass("btn-success").prop("disabled",true);
        
                        $("#affichage").append(`
                        <div class='felicitations col-md-6 col-sm-8 mt-4 mb-2 px-4 d-flex flex-column align-items-center text-center' id='félicitations'>
                            <p class="fs-2 text-success mt-2 mb-2 fw-light btn-outline-success">Félicitations !</p>
                            <p class="fs-4 text-light fw-light">Vous avez trouvé le mot : ${mot} en <span class="fw-bold">${nombreTentatives}</span> tentatives !</p>
                            <p class="fs-4 text-light fw-light">Revenez demain pour essayer avec un nouveau mot ! :3</p>
                        </div>
                        `);

                    },3000))
                }    
            }

        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });
})

function getWordLength(){

    var longueur;
    $.ajax({
        url:'https://nique.freeboxos.fr/ajax-word-length',
        method:'POST',
        dataType:'jsonp',
        async:false,
        contentType:"application/JSON",    
        success:function(res){
            console.log("longueur : ",res.longueur);
            longueur = res.longueur; 

            console.log(res)
        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });

    return(longueur)
};

function checkForWordChange(){

    $.ajax({
        url:'https://nique.freeboxos.fr:443/ajax-word-length',
        method:'POST',
        dataType:'jsonp',
        contentType:"application/JSON",    
        success:function(res){
            console.log("longueur check : ",res.longueur);

            if(LONGUEUR != res.longueur)
            {
                window.location.reload();
            }

            console.log(res)
        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });
};

function getFirstLetter(){

    var lettre;

    $.ajax({
        url:'https://nique.freeboxos.fr:443/ajax-first-letter',
        method:'POST',
        dataType:'jsonp',
        async:false,
        success:function(res){

            lettre = res.firstLetter;

            console.log(res)
        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });

    //console.log("lettre:",lettre)
    return lettre;
};

function affichageResultats(len,mot,difference)
{

    nombreTentatives+=1;

    let finalString = "";
    let classe = ""

    for(i=0;i<len;i++)
    {
        if(difference[i] == "_") classe="text-danger"

        else if(difference[i] == "*") classe="text-warning"

        else classe="text-success"

        finalString += "<div class='d-flex align-items-center justify-content-center essai' style='width:"+100/len+"%'><p class='"+classe+"' style='font-size:clamp(10px,4vw,5vw)'>"+mot[i]+"</p></div>"
    }

    $("#affichageResultats").append("<div id='tentative' class='mb-2 w-100 d-flex flex-row align-items-center justify-content-center'>"+finalString+"</div>")
}


function errorHandler(xhr)
{
    if(xhr.status == 420)
    {
        if(!$("#divErreur").length)
        {
            $("#affichageErreur").html(`
            <div class='banned col-md-6 col-sm-8 mt-4 mb-2 d-flex flex-column align-items-center text-center' id='divErreur'>
                <p class="fs-4 text-danger mt-2 mb-2 mx-4 fw-light">Suite à un trop grand nombres de requêtes, votre IP à été bannie pour une heure.</p>
            </div>
            `);    
        }
    }
}


