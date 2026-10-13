<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Attendance API Tests
 *
 * IMPORTANT: Selfie is ONLY evidence. NO face recognition whatsoever.
 * Store location: lat=-6.802766454110481, lon=110.84381260861629, radius=200m
 *
 * Uses actingAs($user, 'sanctum') for proper middleware resolution.
 */
class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private const STORE_LAT = -6.802766454110481;
    private const STORE_LON = 110.84381260861629;

    private Employee $adminEmp;
    private Employee $cashierEmp;
    private User $admin;
    private User $cashier;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        // Seed the geofence settings so the controller can read them if needed
        Setting::create(['key'=>'geofence_latitude','value'=>strval(self::STORE_LAT)]);
        Setting::create(['key'=>'geofence_longitude','value'=>strval(self::STORE_LON)]);
        Setting::create(['key'=>'geofence_radius','value'=>'200']);

        $this->adminEmp = Employee::create([
            'employee_id'=>'EMP-001','name'=>'Admin','email'=>'admin@t.com',
            'phone'=>'081','position'=>'Admin','status'=>'aktif',
        ]);
        $this->admin = User::create([
            'name'=>'Admin','email'=>'admin@t.com',
            'password'=>'Pass@12345','role'=>'admin',
            'employee_id'=>$this->adminEmp->id,
        ]);

        $this->cashierEmp = Employee::create([
            'employee_id'=>'EMP-002','name'=>'Cashier','email'=>'cashier@t.com',
            'phone'=>'082','position'=>'Kasir','status'=>'aktif',
        ]);
        $this->cashier = User::create([
            'name'=>'Cashier','email'=>'cashier@t.com',
            'password'=>'Pass@12345','role'=>'cashier',
            'employee_id'=>$this->cashierEmp->id,
        ]);
    }

    private function fakePhoto(): UploadedFile
    {
        return UploadedFile::fake()->image('selfie.jpg', 100, 100)->size(500);
    }

    // ================================================================
    // CHECK-IN TESTS
    // ================================================================

    public function test_cashier_can_check_in_within_geofence(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT + 0.0001, // ~11m from store
                'longitude' => self::STORE_LON,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('attendances', [
            'employee_id' => $this->cashierEmp->id,
        ]);
    }

    public function test_check_in_stores_server_calculated_distance(): void
    {
        $resp = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT + 0.0001,
                'longitude' => self::STORE_LON,
            ])
            ->assertCreated();

        $distance = $resp->json('data.check_in_distance');
        $this->assertNotNull($distance);
        $this->assertIsNumeric($distance);
    }

    public function test_check_in_outside_geofence_is_rejected(): void
    {
        // ~2.2km from store
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT + 0.02,
                'longitude' => self::STORE_LON + 0.02,
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_check_in_requires_photo(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['photo']);
    }

    public function test_check_in_requires_latitude(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'longitude' => self::STORE_LON,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }

    public function test_check_in_requires_longitude(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'    => $this->fakePhoto(),
                'latitude' => self::STORE_LAT,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['longitude']);
    }

    public function test_duplicate_check_in_same_day_is_rejected(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT + 0.0001,
                'longitude' => self::STORE_LON,
            ])
            ->assertCreated();

        // Second check-in same day
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertStatus(409);
    }

    public function test_check_in_selfie_photo_is_stored_without_face_recognition(): void
    {
        $resp = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertCreated();

        $photoPath = $resp->json('data.check_in_photo');
        $this->assertNotNull($photoPath);

        // No facial recognition data returned — just a file path
        $responseBody = json_encode($resp->json());
        $this->assertStringNotContainsString('embedding', $responseBody);
        $this->assertStringNotContainsString('face_match', $responseBody);
    }

    // ================================================================
    // CHECK-OUT TESTS
    // ================================================================

    public function test_cashier_can_check_out_after_check_in(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])->assertCreated();

        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-out', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $attendance = Attendance::where('employee_id', $this->cashierEmp->id)->first();
        $this->assertNotNull($attendance->check_out_at);
        $this->assertNotNull($attendance->check_out_photo);
    }

    public function test_cannot_check_out_without_checking_in(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-out', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertStatus(422);
    }

    public function test_duplicate_check_out_is_rejected(): void
    {
        $payload = ['photo'=>$this->fakePhoto(),'latitude'=>self::STORE_LAT,'longitude'=>self::STORE_LON];

        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', $payload)->assertCreated();
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-out', array_merge($payload, ['photo'=>$this->fakePhoto()]))->assertOk();
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-out', array_merge($payload, ['photo'=>$this->fakePhoto()]))->assertStatus(409);
    }

    // ================================================================
    // STATUS LOGIC — hadir vs terlambat
    // ================================================================

    public function test_check_in_before_8am_results_in_hadir_status(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(7, 30, 0));

        $resp = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertCreated();

        $this->assertEquals('hadir', $resp->json('data.status'));

        Carbon::setTestNow();
    }

    public function test_check_in_at_or_after_8am_results_in_terlambat_status(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));

        $resp = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'     => $this->fakePhoto(),
                'latitude'  => self::STORE_LAT,
                'longitude' => self::STORE_LON,
            ])
            ->assertCreated();

        $this->assertEquals('terlambat', $resp->json('data.status'));

        Carbon::setTestNow();
    }

    // ================================================================
    // MANUAL ATTENDANCE
    // ================================================================

    public function test_admin_can_create_manual_attendance(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/attendance/manual', [
                'employee_id' => $this->cashierEmp->id,
                'date'        => now()->format('Y-m-d'),
                'status'      => 'izin',
                'note'        => 'Keperluan keluarga',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('attendances', [
            'employee_id' => $this->cashierEmp->id,
            'status'      => 'izin',
        ]);
    }

    public function test_manual_attendance_does_not_require_gps_or_selfie(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/attendance/manual', [
                'employee_id' => $this->cashierEmp->id,
                'date'        => now()->format('Y-m-d'),
                'status'      => 'sakit',
            ])
            ->assertCreated();

        $record = Attendance::where('employee_id', $this->cashierEmp->id)->first();
        $this->assertNull($record->check_in_photo);
        $this->assertNull($record->check_in_latitude);
    }

    public function test_cashier_cannot_create_manual_attendance(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/attendance/manual', [
                'employee_id' => $this->cashierEmp->id,
                'date'        => now()->format('Y-m-d'),
                'status'      => 'izin',
            ])
            ->assertStatus(403);
    }

    public function test_manual_attendance_invalid_status_rejected(): void
    {
        // 'hadir' is not valid for manual (must be izin/sakit/alpha)
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/attendance/manual', [
                'employee_id' => $this->cashierEmp->id,
                'date'        => now()->format('Y-m-d'),
                'status'      => 'hadir',
            ])
            ->assertStatus(422);
    }

    public function test_duplicate_manual_attendance_is_rejected(): void
    {
        $payload = ['employee_id'=>$this->cashierEmp->id,'date'=>now()->format('Y-m-d'),'status'=>'alpha'];

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/attendance/manual', $payload)->assertCreated();
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/attendance/manual', $payload)->assertStatus(409);
    }

    // ================================================================
    // HISTORY / LISTING ENDPOINTS
    // ================================================================

    public function test_admin_can_view_all_attendance(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/attendance')->assertOk();
    }

    public function test_cashier_cannot_view_all_attendance(): void
    {
        $this->actingAs($this->cashier, 'sanctum')->getJson('/api/attendance')->assertStatus(403);
    }

    public function test_admin_can_view_attendance_today(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/attendance/today')->assertOk();
    }

    public function test_cashier_cannot_view_attendance_today(): void
    {
        $this->actingAs($this->cashier, 'sanctum')->getJson('/api/attendance/today')->assertStatus(403);
    }

    public function test_cashier_can_view_own_attendance(): void
    {
        $this->actingAs($this->cashier, 'sanctum')->getJson('/api/attendance/my')->assertOk();
    }

    public function test_attendance_response_includes_both_note_and_notes_fields(): void
    {
        Attendance::create([
            'employee_id' => $this->cashierEmp->id,
            'date'        => now()->subDay()->format('Y-m-d'), // yesterday (not today) to avoid conflict
            'status'      => 'izin',
            'note'        => 'Sakit',
        ]);

        // Use /my/history to get paginated list
        $resp = $this->actingAs($this->cashier, 'sanctum')
            ->getJson('/api/attendance/my/history')
            ->assertOk();

        // data.data is an array of attendance records
        $items = $resp->json('data.data');

        $this->assertIsArray($items);
        $this->assertNotEmpty($items);

        $first = $items[0];

        $this->assertIsArray($first);
        $this->assertArrayHasKey('note', $first);
        $this->assertArrayHasKey('notes', $first);
        $this->assertEquals('Sakit', $first['note']);
        $this->assertEquals('Sakit', $first['notes']);
    }


    public function test_owner_cannot_check_in(): void
    {
        $ownerEmp = Employee::create(['employee_id'=>'EMP-004','name'=>'Owner','email'=>'owner@t.com','phone'=>'083','position'=>'Owner','status'=>'aktif']);
        $owner = User::create(['name'=>'Owner','email'=>'owner@t.com','password'=>'Pass@12345','role'=>'owner','employee_id'=>$ownerEmp->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/attendance/check-in', [
                'photo'=>$this->fakePhoto(),'latitude'=>self::STORE_LAT,'longitude'=>self::STORE_LON,
            ])
            ->assertStatus(403);
    }

    public function test_admin_can_access_attendance_report(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/attendance/report?month=' . now()->format('Y-m'))
            ->assertOk();
    }

    public function test_cashier_cannot_access_attendance_report(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->getJson('/api/attendance/report')
            ->assertStatus(403);
    }
}
