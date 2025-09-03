<?php
namespace OCA\Followme\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use OCA\Followme\Db\Request;
use OCA\Followme\Db\Followme;
use OCA\Followme\Db\FollowmeMapper;
use OCA\Followme\Db\FollowmeparamMapper;


class PageController extends Controller {
	
	private $userId;
	private $clientRequest;
	private $followmeMapper;
	private $followmeparamMapper;

	public function __construct(string $AppName, IRequest $request, $UserId, Request $clientRequest, FollowmeMapper $followmeMapper, FollowmeparamMapper $followmeparamMapper){
		parent::__construct($AppName, $request);
		$this->userId = $UserId;
		$this->clientRequest = $clientRequest;
		$this->followmeMapper = $followmeMapper;
		$this->followmeparamMapper = $followmeparamMapper;
	}

	/**
	 * CAUTION: the @Stuff turns off security checks; for this page no admin is
	 *          required and no CSRF check. If you don't know what CSRF is, read
	 *          it up in the docs or you might create a security hole. This is
	 *          basically the only required method to add this exemption, don't
	 *          add it to any other method if you don't exactly know what it does
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		return new TemplateResponse('followme', 'index', array('key' => $this->nomComplet()));  // templates/index.php
	}


	/**
	 * CAUTION: the @Stuff turns off security checks; for this page no admin is
	 *          required and no CSRF check. If you don't know what CSRF is, read
	 *          it up in the docs or you might create a security hole. This is
	 *          basically the only required method to add this exemption, don't
	 *          add it to any other method if you don't exactly know what it does
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function param() {

		$keys = $this->followmeparamMapper->getParam();
		foreach ($keys as $key => $value) {
				$myname = $value['name'];
				$myArray[$myname] = $value['value'];
		}

		if(!is_null($myArray))
			return new TemplateResponse('followme', 'param', $myArray);
		else
			return new TemplateResponse('followme', 'param');
	}

	/**
	 * CAUTION: the @Stuff turns off security checks; for this page no admin is
	 *          required and no CSRF check. If you don't know what CSRF is, read
	 *          it up in the docs or you might create a security hole. This is
	 *          basically the only required method to add this exemption, don't
	 *          add it to any other method if you don't exactly know what it does
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @param string $userIdWP
	 * @param string $passwordWP
	 * @param string $userIdRC
	 * @param string $passwordRC
	 */
	public function paramInsert($userIdWP, $passwordWP, $urlWP, $userIdRC, $passwordRC, $urlRC, $roomRC){
		$this->followmeparamMapper->insertParam($userIdWP, $passwordWP, $urlWP, $userIdRC, $passwordRC, $urlRC, $roomRC);

		$keys = $this->followmeparamMapper->getParam();
		foreach ($keys as $key => $value) {
			$myname = $value['name'];
			$myArray[$myname] = $value['value'];
		}

		$myArray['key'] = $this->nomComplet();
		$myArray['validation'] = 'ok';

		return new TemplateResponse('followme', 'param', $myArray );
	}

	/**
	 * Recherche du nom complet d'une personne
	 */
	private function nomComplet(){
		$myObj = json_decode($this->clientRequest->find($this->userId)['data']);
		$parameters = $myObj->{'displayname'}->{'value'};
		return $parameters;
	}


	/**
	 * @NoAdminRequired
	 * @param string $intervaldebut
	 * @param string $intervalfin
	 */
	public function showActu(string $intervaldebut, string $intervalfin) {
		try {
			return new DataResponse($this->followmeMapper->findAll(array($intervaldebut, $intervalfin)));
		} catch(Exception $e) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
	}

	/**
	 * @NoAdminRequired
	 * @param string $intervaldebut
	 * @param string $intervalfin
	 */
	public function postActuInterval(string $intervaldebut, string $intervalfin) {
		try {
			return new DataResponse($this->followmeMapper->findAllInterval($intervaldebut,$intervalfin));
		} catch(Exception $e) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
	}



	/**
	 * @NoAdminRequired
	 * @param int $id
	 */
	public function findActu(int $id) {
		try {
			$actu = $this->followmeMapper->findArticleById($id);
			$data = array("actu" => $actu);
			return new DataResponse($data);
		} catch(Exception $e) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
	}



	/**
	* @NoAdminRequired
	* @param string $date
    * @param string $lien
	* @param string $description
	* @param string $categorie
	* @param string $title
	*/
	public function insertActu(string $date, string $lien, string $description, string $categorie, string $title) {
		 	$nom = $this->nomComplet();
			$res1 = $this->followmeMapper->insertActu(
                $date,
                $this->nomComplet(),
                $lien,
                $description,
                $categorie,
                $title
            );
			$res2 = $this->sendRocketChat("$categorie - $nom --> $lien");
			return new DataResponse(array('msg1' => $res1, 'msg2' => $res2));
	}

	/**
	* Envoie d'un message sur rocket chat
	*/
	private function sendRocketChat(String $message){
		$resAuth = $this->AuthRocketChat();

		$data_string = json_encode(array('channel' => $this->followmeparamMapper->getParamByName('roomRC'),'text' => $message));
		$url = $this->followmeparamMapper->getParamByName('urlRC').'/api/v1/chat.postMessage';
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(	"Content-Type: application/json","Accept: application/json",
														"X-Auth-Token: ".$resAuth->{'data'}->{'authToken'},
														"X-User-Id: ".$resAuth->{'data'}->{'userId'}));
		$json_response = curl_exec($curl);
		curl_close($curl);
		$res = json_decode($json_response);
		return $res;
	}

	/**
	* Authentification sur rocket chat
	*/
	private function AuthRocketChat(){
		$data_string = json_encode(array(	'user' => $this->followmeparamMapper->getParamByName('userIdRC'),
											'password' =>  $this->followmeparamMapper->getParamByName('passwordRC')));
		$url = $this->followmeparamMapper->getParamByName('urlRC').'/api/v1/login';
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: application/json","Accept: application/json"));
		$json_response = curl_exec($curl);
		curl_close($curl);
		$res = json_decode($json_response);
		return $res;
	}


	/**
	* @NoAdminRequired
	* @param string $date
	* @param string $lien
	* @param string $description
	* @param string $categorie
	* @param string $idArticle
	* @param string $title
	*/
	public function updateActu(string $date, string $lien, string $description, string $categorie, string $idArticle, string $title) {
		return new DataResponse($this->followmeMapper->updateActu($date, $this->nomComplet(), $lien, $description, $categorie, $idArticle, $title));
	}

	/**
	* @NoAdminRequired
	* @param string $id
	*/
	public function delActu(string $id) {
		return new DataResponse($this->followmeMapper->delActu($id));
	}


	/**
	* @param string $titre
	* @param string $content
	*/
	public function envoieWP($titre, $content) {
		try{
		$data_string = json_encode(array(	'title' => $titre, 
											'content' => $content));
		$url = $this->followmeparamMapper->getParamByName('urlWP').'/wp-json/wp/v2/posts';

		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: application/json","Accept: application/json"));
        curl_setopt($curl, CURLOPT_USERPWD, $this->followmeparamMapper->getParamByName('userIdWP').":".$this->followmeparamMapper->getParamByName('passwordWP'));
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
		$json_response = curl_exec($curl);
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

		if ( $status != 201 ) {
		    die("Error: call to URL $url failed with status $status, response $json_response, curl_error " . curl_error($curl) . ", curl_errno " . curl_errno($curl));
		}

		curl_close($curl);
		$res = json_decode($json_response, true);
		}catch(Exception $e){
		}
		return new DataResponse($res);
	}


	/**
	 * @NoAdminRequired
	 */
	public function findCategorie(){
		return new DataResponse($this->followmeMapper->findCategorie());
	}

	/**
	 * @NoAdminRequired
	 * @param string $year
	 */
	public function getNbArticleByUser($year){
		return new DataResponse($this->followmeMapper->getNbArticleByUser(array($year)));
	}
}
