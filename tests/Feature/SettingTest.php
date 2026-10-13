<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, string $empId, string $email): User
    {
        $emp = Employee::create(['employee_id'=>$empId,'name'=>ucfirst($role),'email'=>$email,'phone'=>'08x','position'=>ucfirst($role),'status'=>'aktif']);
        return User::create(['name'=>ucfirst($role),'email'=>$email,'password'=>'Pass@12345','role'=>$role,'employee_id'=>$emp->id]);
    }

    public function test_admin_can_read_settings(): void
    {
        Setting::create(['key'=>'store_name','value'=>'PRO.COM']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.store_name', 'PRO.COM');
    }

    public function test_admin_can_update_settings(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/settings', [
                'store_name'    => 'New Store Name',
                'store_address' => 'Jl. Test',
                'store_phone'   => '021-000',
                'store_email'   => 'new@store.com',
            ])
            ->assertOk();
        $this->assertDatabaseHas('settings', ['key'=>'store_name','value'=>'New Store Name']);
    }

    public function test_cashier_cannot_access_settings(): void
    {
        $this->actingAs($this->makeUser('cashier','EMP-001','cashier@t.com'), 'sanctum')
            ->getJson('/api/settings')
            ->assertStatus(403);
    }

    public function test_owner_cannot_modify_settings(): void
    {
        $this->actingAs($this->makeUser('owner','EMP-001','owner@t.com'), 'sanctum')
            ->putJson('/api/settings', ['store_name'=>'Hack'])
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_settings(): void
    {
        $this->getJson('/api/settings')->assertStatus(401);
    }

    public function test_geofence_settings_persist_correctly(): void
    {
        Setting::create(['key'=>'geofence_latitude','value'=>'-6.802766454110481']);
        Setting::create(['key'=>'geofence_longitude','value'=>'110.84381260861629']);
        Setting::create(['key'=>'geofence_radius','value'=>'200']);

        $resp = $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/settings')
            ->assertOk();
        $this->assertEquals('-6.802766454110481', $resp->json('data.geofence_latitude'));
        $this->assertEquals('200', $resp->json('data.geofence_radius'));
    }
}
