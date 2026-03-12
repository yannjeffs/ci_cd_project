<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    //a retirer après
    protected function setUp(): void
    {
        parent::setUp();

        $this->app['env'] = "testing";
    }
}
