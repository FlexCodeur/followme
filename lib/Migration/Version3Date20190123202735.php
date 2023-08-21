<?php

declare(strict_types=1);

namespace OCA\Followme\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

/**
 * Auto-generated migration step: Please modify to your needs!
 */
class Version3Date20190123202735 extends SimpleMigrationStep {

	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 */
	public function preSchemaChange(IOutput $output, Closure $schemaClosure, array $options) {
	}

	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
		/** @var ISchemaWrapper $schema */
          $schema = $schemaClosure();

          if (!$schema->hasTable('followme')) {
              $table = $schema->createTable('followme');
              $table->addColumn('id', 'integer', [
                  'autoincrement' => true,
                  'notnull' => true,
              ]);
              $table->addColumn('date', 'integer', [
                  'notnull' => true,
              ]);
              $table->addColumn('utilisateur', 'string', [
                  'notnull' => true,
                  'length' => 64,
              ]);
              $table->addColumn('lien', 'text', [
                  'notnull' => true,
              ]);
              $table->addColumn('description', 'text', [
                  'notnull' => true,
              ]);
              $table->addColumn('categorie', 'string', [
                  'notnull' => true,
                  'length' => 64,
              ]);

              $table->setPrimaryKey(['id']);
          }

          return $schema;
	}

	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 */
	public function postSchemaChange(IOutput $output, Closure $schemaClosure, array $options) {
	}
}
