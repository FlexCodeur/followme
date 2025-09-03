<div class="modal" id="edit_followme" data-mode="ajout" data-id-article="">
  <form>
    <div class="header">
      <h2>Editer</h2>
      <button type="button" class="fermer_modal" id="croix">
        <span class="jam jam-close"></span>
      </button>
    </div>
    <hr>
    <div class="section-wrapper">
        <div class="section">
            <input required type="text" name="titlefollowme" id="titlefollowme" placeholder="Titre de votre actu"/>
        </div>
      <div class="section">
        <input required type="date" name="datefollowme" id="datefollowme" placeholder="Date de la news"/>
        <input required type="text" name="lienfollowme" id="lienfollowme" placeholder="Lien de votre actu"/>
      </div>
      <div class="section wrap reverse">
        <textarea required name="descriptionfollowme" id="descriptionfollowme" placeholder="Donner une description de votre actualité" maxlength="500"></textarea>
        <p class="counter"><span id="nbCaracteres">0</span>/500 caractères</p>
      </div>
      <div class="section">
        <select required name="categoriefollowme" id="categoriefollowme" list="categorie" placeholder="La cat&eacute;gorie">
        </select>
      </div>
    </div>
    <hr>
    <div class="footer">
      <button type="button" class="fermer_modal"><span class="jam jam-close"></span>Annuler</button>
      <button type="submit" class="valider_modal"><span class="jam jam-check"></span>Valider</button>
    </div>
  </form>
</div>
