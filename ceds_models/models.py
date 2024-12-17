from django.db import models
from django.contrib.auth.models import User

class Person(models.Model):
    """
    Modelo que representa una persona en el sistema educativo.
    Almacena información básica como nombre, fecha de nacimiento, etnicidad, etc.
    """
    person_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=35)
    middle_name = models.CharField(max_length=35, null=True, blank=True)
    last_name = models.CharField(max_length=35)
    generation_code = models.CharField(max_length=10, null=True, blank=True)
    prefix = models.CharField(max_length=30, null=True, blank=True)
    birthdate = models.DateField()
    ref_sex_id = models.IntegerField()
    hispanic_latino_ethnicity = models.BooleanField()
    ref_us_citizenship_status_id = models.IntegerField()
    ref_visa_type_id = models.IntegerField(null=True, blank=True)
    ref_state_of_residence_id = models.IntegerField()
    ref_proof_of_residency_type_id = models.IntegerField()
    ref_highest_education_level_completed_id = models.IntegerField()
    ref_personal_information_verification_id = models.IntegerField()
    birthdate_verification = models.CharField(max_length=60, null=True, blank=True)
    ref_tribal_affiliation_id = models.IntegerField(null=True, blank=True)

class PersonBirthplace(models.Model):
    """
    Modelo que almacena el lugar de nacimiento de una persona.
    Incluye ciudad, estado y país de nacimiento.
    """
    person = models.OneToOneField(Person, primary_key=True, on_delete=models.CASCADE)
    city = models.CharField(max_length=30)
    ref_state_id = models.IntegerField(null=True, blank=True)
    ref_country_id = models.IntegerField()

class PersonIdentifier(models.Model):
    """
    Modelo para gestionar los diferentes identificadores de una persona
    (por ejemplo: número de estudiante, número de seguro social, etc.)
    """
    person_identifier_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    identifier = models.CharField(max_length=40)
    ref_person_identification_system_id = models.IntegerField()
    ref_personal_information_verification_id = models.IntegerField()

class PersonRelationship(models.Model):
    """
    Modelo que gestiona las relaciones entre personas
    (por ejemplo: padre-hijo, tutor-estudiante, etc.)
    """
    person_relationship_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='relationships')
    related_person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='related_to')
    ref_person_relationship_id = models.IntegerField()
    custodial_relationship_indicator = models.BooleanField()
    emergency_contact_ind = models.BooleanField()
    contact_priority_number = models.IntegerField(null=True, blank=True)
    contact_restrictions = models.CharField(max_length=2000, null=True, blank=True)
    lives_with_indicator = models.BooleanField()
    primary_contact_indicator = models.BooleanField()

class PersonAddress(models.Model):
    """
    Modelo que almacena las direcciones asociadas a una persona.
    Puede incluir dirección de residencia, postal, etc.
    """
    person_address_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    ref_person_location_type_id = models.IntegerField()
    street_number_and_name = models.CharField(max_length=40)
    apartment_room_or_suite_number = models.CharField(max_length=30, null=True, blank=True)
    city = models.CharField(max_length=30)
    ref_state_id = models.IntegerField()
    postal_code = models.CharField(max_length=17)
    address_county_name = models.CharField(max_length=30, null=True, blank=True)
    ref_county_id = models.IntegerField(null=True, blank=True)
    ref_country_id = models.IntegerField()
    latitude = models.CharField(max_length=20, null=True, blank=True)
    longitude = models.CharField(max_length=20, null=True, blank=True)
    ref_personal_information_verification_id = models.IntegerField()

class PersonTelephone(models.Model):
    """
    Modelo para almacenar los números telefónicos de una persona.
    Permite múltiples teléfonos con diferentes propósitos.
    """
    person_telephone_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    telephone_number = models.CharField(max_length=24)
    primary_telephone_number_indicator = models.BooleanField()
    ref_person_telephone_number_type_id = models.IntegerField()

class PersonEmailAddress(models.Model):
    """
    Modelo para gestionar las direcciones de correo electrónico de una persona.
    """
    person_email_address_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    email_address = models.CharField(max_length=128)
    ref_email_type_id = models.IntegerField()

class PersonLanguage(models.Model):
    """
    Modelo que registra los idiomas que domina una persona
    y el tipo de uso (hablado, escrito, etc.)
    """
    person_language_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    ref_language_id = models.IntegerField()
    ref_language_use_type_id = models.IntegerField()

class Organization(models.Model):
    """
    Modelo base para representar una organización educativa
    (escuela, distrito, etc.)
    """
    organization_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=128)
    ref_organization_type_id = models.IntegerField()
    short_name = models.CharField(max_length=30, null=True, blank=True)
    region_geo_json = models.CharField(max_length=2000, null=True, blank=True)

class OrganizationPersonRole(models.Model):
    """
    Modelo que vincula personas con organizaciones y define sus roles
    (estudiante, profesor, administrativo, etc.)
    """
    organization_person_role_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    role_id = models.IntegerField()
    entry_date = models.DateTimeField()
    exit_date = models.DateTimeField(null=True, blank=True)

class RoleStatus(models.Model):
    """
    Modelo que gestiona el estado de un rol en un momento determinado.
    Permite hacer seguimiento de los cambios de estado de un rol a lo largo del tiempo.
    """
    role_status_id = models.AutoField(primary_key=True)
    status_start_date = models.DateField()
    status_end_date = models.DateTimeField(null=True, blank=True)
    ref_role_status_id = models.IntegerField()
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)

class RoleAttendance(models.Model):
    """
    Modelo que registra la asistencia asociada a un rol.
    Almacena métricas como días de asistencia, ausencias y tasa de asistencia.
    """
    role_attendance_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    number_of_days_in_attendance = models.DecimalField(max_digits=9, decimal_places=2)
    number_of_days_absent = models.DecimalField(max_digits=9, decimal_places=2)
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=4)

class RoleAttendanceEvent(models.Model):
    """
    Modelo que registra eventos específicos de asistencia.
    Incluye tipos de eventos, estados y categorías de ausencia/presencia.
    """
    role_attendance_event_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    date = models.DateField()
    ref_attendance_event_type_id = models.IntegerField()
    ref_attendance_status_id = models.IntegerField()
    ref_absent_attendance_category_id = models.IntegerField()
    ref_present_attendance_category_id = models.IntegerField()
    ref_leave_event_type_id = models.IntegerField()

class Role(models.Model):
    """
    Modelo base para definir roles en el sistema.
    Define los tipos de roles disponibles y su jurisdicción.
    """
    role_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    ref_jurisdiction_id = models.IntegerField()

class OrganizationCalendarCrisis(models.Model):
    """
    Modelo para gestionar situaciones de crisis en el calendario organizacional.
    Registra eventos como cierres de emergencia, desastres naturales, etc.
    """
    organization_calendar_crisis_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    code = models.CharField(max_length=30)
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    type = models.CharField(max_length=50)
    crisis_description = models.CharField(max_length=300)
    crisis_end_date = models.DateField()

class OrganizationCalendar(models.Model):
    """
    Modelo que define el calendario académico de una organización.
    Gestiona los períodos y años escolares.
    """
    organization_calendar_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    calendar_code = models.CharField(max_length=30)
    calendar_description = models.CharField(max_length=60)
    calendar_year = models.CharField(max_length=4)

class OrganizationCalendarSession(models.Model):
    """
    Modelo que define las sesiones específicas dentro de un calendario.
    Incluye períodos de instrucción, horarios y detalles de la sesión.
    """
    organization_calendar_session_id = models.AutoField(primary_key=True)
    designator = models.CharField(max_length=7)
    begin_date = models.DateField()
    end_date = models.DateField()
    ref_session_type_id = models.IntegerField()
    instructional_minutes = models.DecimalField(max_digits=18, decimal_places=0)
    code = models.CharField(max_length=30)
    description = models.TextField()
    marking_term_indicator = models.BooleanField()
    scheduling_term_indicator = models.BooleanField()
    attendance_term_indicator = models.BooleanField()
    organization_calendar = models.ForeignKey(OrganizationCalendar, on_delete=models.CASCADE)
    days_in_session = models.IntegerField()
    first_instruction_date = models.DateField()
    last_instruction_date = models.DateField()
    minutes_per_day = models.IntegerField()
    session_start_time = models.TimeField()
    session_end_time = models.TimeField()

class OrganizationCalendarEvent(models.Model):
    """
    Modelo para eventos específicos en el calendario organizacional.
    Registra eventos como días festivos, reuniones, etc.
    """
    organization_calendar_event_id = models.AutoField(primary_key=True)
    organization_calendar = models.ForeignKey(OrganizationCalendar, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    event_date = models.DateField()
    ref_calendar_event_type = models.IntegerField()

class K12StudentEmployment(models.Model):
    """
    Modelo que registra información sobre el empleo de estudiantes K12.
    Incluye datos sobre empleo durante y después de la inscripción.
    """
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    ref_employed_while_enrolled_id = models.IntegerField()
    ref_employed_after_exit_id = models.IntegerField()
    employment_naics_code = models.CharField(max_length=6)

class K12StudentSession(models.Model):
    """
    Modelo que registra el desempeño del estudiante en una sesión específica.
    Incluye promedios y métricas de rendimiento por sesión.
    """
    k12_student_session_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    organization_calendar_session = models.ForeignKey(OrganizationCalendarSession, on_delete=models.CASCADE)
    grade_point_average_given_session = models.DecimalField(max_digits=9, decimal_places=4)

class K12StudentEnrollment(models.Model):
    """
    Modelo que gestiona la inscripción de estudiantes K12.
    Incluye información sobre entrada, salida y estado de inscripción.
    """
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    ref_entry_grade_level_id = models.IntegerField()
    ref_public_school_residence = models.IntegerField()
    ref_enrollment_status_id = models.IntegerField()
    ref_entry_type = models.IntegerField()
    ref_exit_grade_level = models.IntegerField()
    ref_exit_or_withdrawal_status_id = models.IntegerField()
    ref_exit_or_withdrawal_type_id = models.IntegerField()
    displaced_student_status = models.BooleanField()
    ref_end_of_term_status_id = models.IntegerField()
    ref_promotion_reason_id = models.IntegerField()
    ref_non_promotion_reason_id = models.IntegerField()
    ref_food_service_eligibility_id = models.IntegerField()
    first_entry_date_into_us_school = models.DateField()
    ref_directory_information_block_status_id = models.IntegerField()
    nslp_direct_certification_indicator = models.BooleanField()
    ref_student_enrollment_access_type_id = models.IntegerField()

class K12StudentAcademicHonor(models.Model):
    """
    Modelo que registra los honores académicos recibidos por estudiantes K12.
    Incluye tipos de honores y descripciones.
    """
    k12_student_academic_honor_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    ref_academic_honor_type_id = models.IntegerField()
    honor_description = models.CharField(max_length=80)

class K12StudentAcademicRecord(models.Model):
    """
    Modelo que mantiene el registro académico completo del estudiante.
    Incluye créditos, promedios y rangos de clase.
    """
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    credits_attempted_cumulative = models.DecimalField(max_digits=9, decimal_places=2)
    credits_earned_cumulative = models.DecimalField(max_digits=9, decimal_places=2)
    grade_points_earned_cumulative = models.DecimalField(max_digits=9, decimal_places=2)
    grade_point_average_cumulative = models.DecimalField(max_digits=9, decimal_places=4)
    ref_gpa_weighted_indicator_id = models.IntegerField()
    projected_graduation_date = models.CharField(max_length=7)
    high_school_student_class_rank = models.IntegerField(null=True, blank=True)
    class_ranking_date = models.CharField(max_length=10, null=True, blank=True)
    total_number_in_class = models.IntegerField(null=True, blank=True)
    diploma_or_credential_award_date = models.CharField(max_length=7, null=True, blank=True)
    ref_high_school_diploma_type_id = models.IntegerField()
    ref_high_school_diploma_distinction_type_id = models.IntegerField()
    ref_technology_literacy_status_id = models.IntegerField()
    ref_ps_enrollment_action_id = models.IntegerField()
    ref_pre_and_post_test_indicator_id = models.IntegerField()
    ref_professional_technical_credential_type_id = models.IntegerField()
    ref_progress_level_id = models.IntegerField()

class K12StudentDiscipline(models.Model):
    """
    Modelo que registra incidentes disciplinarios y acciones tomadas.
    Incluye razones, duraciones y tipos de acciones disciplinarias.
    """
    k12_student_discipline_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    ref_discipline_reason_id = models.IntegerField()
    ref_disciplinary_action_taken_id = models.IntegerField()
    disciplinary_action_start_date = models.DateField()
    disciplinary_action_end_date = models.DateField()
    duration_of_disciplinary_action = models.DecimalField(max_digits=9, decimal_places=2)
    ref_discipline_length_difference_reason_id = models.IntegerField()
    full_year_expulsion = models.BooleanField()
    shortened_expulsion = models.BooleanField()
    educational_services_after_removal = models.BooleanField()
    ref_idea_interim_removal_id = models.IntegerField()
    ref_idea_interim_removal_reason_id = models.IntegerField()
    related_to_zero_tolerance_policy = models.BooleanField()
    incident = models.ForeignKey('Incident', on_delete=models.CASCADE)
    iep_placement_meeting_indicator = models.BooleanField()
    ref_discipline_method_firearms_id = models.IntegerField()
    ref_discipline_method_of_cwd_id = models.IntegerField()
    ref_idea_discipline_method_firearm_id = models.IntegerField()

class K12StudentCourseSection(models.Model):
    """
    Modelo que gestiona la participación del estudiante en secciones de cursos.
    Incluye calificaciones, créditos y estado de inscripción.
    """
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    ref_course_repeat_code_id = models.IntegerField()
    ref_course_section_enrollment_status_type_id = models.IntegerField()
    ref_course_section_entry_type_id = models.IntegerField()
    ref_course_section_exit_type_id = models.IntegerField()
    ref_exit_or_withdrawal_status_id = models.IntegerField()
    ref_grade_level_when_course_taken_id = models.IntegerField()
    grade_earned = models.CharField(max_length=15)
    grade_value_qualifier = models.CharField(max_length=100)
    number_of_credits_attempted = models.DecimalField(max_digits=9, decimal_places=2)
    ref_credit_type_earned_id = models.IntegerField()
    ref_additional_credit_type_id = models.IntegerField()
    ref_pre_and_post_test_indicator_id = models.IntegerField()
    ref_progress_level_id = models.IntegerField()
    ref_course_gpa_applicability_id = models.IntegerField()
    number_of_credits_earned = models.DecimalField(max_digits=9, decimal_places=2)
    tuition_funded = models.BooleanField()
    exit_withdrawal_date = models.DateField()

class CourseSection(models.Model):
    """
    Modelo que define una sección específica de un curso.
    Incluye detalles sobre modalidad, capacidad y créditos disponibles.
    """
    organization = models.OneToOneField(Organization, primary_key=True, on_delete=models.CASCADE)
    available_carnegie_unit_credit = models.DecimalField(max_digits=9, decimal_places=2)
    ref_course_section_delivery_mode_id = models.IntegerField()
    ref_single_sex_class_status_id = models.IntegerField()
    time_required_for_completion = models.DecimalField(max_digits=9, decimal_places=0)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    ref_additional_credit_type_id = models.IntegerField()
    ref_instruction_language_id = models.IntegerField()
    virtual_indicator = models.BooleanField()
    organization_calendar_session = models.ForeignKey(OrganizationCalendarSession, on_delete=models.CASCADE)
    ref_credit_type_earned_id = models.IntegerField()
    ref_advanced_placement_course_code_id = models.IntegerField()
    maximum_capacity = models.IntegerField()
    related_competency_framework_items = models.CharField(max_length=60)

class Course(models.Model):
    """
    Modelo base para definir un curso.
    Incluye descripción, créditos y características generales del curso.
    """
    organization = models.OneToOneField(Organization, primary_key=True, on_delete=models.CASCADE)
    description = models.CharField(max_length=60)
    subject_abbreviation = models.CharField(max_length=50)
    sced_sequence_of_course = models.CharField(max_length=50)
    instructional_minutes = models.IntegerField()
    ref_course_level_characteristics_id = models.IntegerField()
    ref_course_credit_unit_id = models.IntegerField()
    credit_value = models.DecimalField(max_digits=9, decimal_places=2)
    ref_instruction_language = models.IntegerField()
    certification_description = models.CharField(max_length=300)
    ref_course_applicable_education_level_id = models.IntegerField()
    repeatability_maximum_number = models.IntegerField()

class K12Course(models.Model):
    """
    Modelo específico para cursos de nivel K12.
    Incluye requisitos, estándares y características específicas de K12.
    """
    organization = models.OneToOneField(Organization, primary_key=True, on_delete=models.CASCADE)
    high_school_course_requirement = models.BooleanField()
    ref_additional_credit_type_id = models.IntegerField()
    available_carnegie_unit_credit = models.DecimalField(max_digits=9, decimal_places=2)
    ref_course_gpa_applicability_id = models.IntegerField()
    core_academic_course = models.BooleanField()
    ref_curriculum_framework_type_id = models.IntegerField()
    course_aligned_with_standards = models.BooleanField()
    ref_credit_type_earned_id = models.IntegerField()
    funding_program = models.CharField(max_length=30)
    family_consumer_sciences_course_ind = models.BooleanField()
    sced_course_code = models.CharField(max_length=5)
    sced_grade_span = models.CharField(max_length=4)
    ref_sced_course_level_id = models.IntegerField()
    ref_sced_course_subject_area_id = models.IntegerField()
    ref_career_cluster_id = models.IntegerField()
    ref_blended_learning_model_type_id = models.IntegerField()
    ref_course_interaction_mode_id = models.IntegerField()
    ref_k12_end_of_course_requirement_id = models.IntegerField()
    ref_workbased_learning_opportunity_type_id = models.IntegerField()
    course_department_name = models.CharField(max_length=60)

class Location(models.Model):
    """
    Modelo base para gestionar ubicaciones físicas.
    Sirve como punto de referencia para direcciones y lugares.
    """
    location_id = models.AutoField(primary_key=True)

class Classroom(models.Model):
    """
    Modelo que representa un aula física.
    Extiende el modelo de Location para espacios de clase específicos.
    """
    location = models.OneToOneField(Location, primary_key=True, on_delete=models.CASCADE)
    classroom_identifier = models.CharField(max_length=40)

class LocationAddress(models.Model):
    """
    Modelo que almacena detalles de dirección para una ubicación.
    Incluye información completa de dirección y coordenadas geográficas.
    """
    location = models.OneToOneField(Location, primary_key=True, on_delete=models.CASCADE)
    street_number_and_name = models.CharField(max_length=40)
    apartment_room_or_suite_number = models.CharField(max_length=30, null=True, blank=True)
    building_site_number = models.CharField(max_length=30, null=True, blank=True)
    city = models.CharField(max_length=30)
    ref_state_id = models.IntegerField()
    postal_code = models.CharField(max_length=17)
    county_name = models.CharField(max_length=30, null=True, blank=True)
    ref_county_id = models.IntegerField()
    ref_country_id = models.IntegerField()
    latitude = models.CharField(max_length=20, null=True, blank=True)
    longitude = models.CharField(max_length=20, null=True, blank=True)
    ref_ers_rural_urban_continuum_code_id = models.IntegerField()
    facility_block_number_area = models.CharField(max_length=100)
    facility_census_tract = models.CharField(max_length=100)

class FacilityLocation(models.Model):
    facility_location_id = models.AutoField(primary_key=True)
    facility_id = models.IntegerField()
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

class PersonStatus(models.Model):
    person_status_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    ref_person_status_type_id = models.IntegerField()
    status_value = models.BooleanField()
    status_start_date = models.DateField()
    status_end_date = models.DateField(null=True, blank=True)

class OrganizationWebsite(models.Model):
    organization = models.OneToOneField(Organization, primary_key=True, on_delete=models.CASCADE)
    website = models.CharField(max_length=300)

class OrganizationEmail(models.Model):
    organization_email_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    electronic_mail_address = models.CharField(max_length=128)
    ref_email_type_id = models.IntegerField()

class OrganizationTelephone(models.Model):
    organization_telephone_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    telephone_number = models.CharField(max_length=24)
    primary_telephone_number_indicator = models.BooleanField()
    ref_institution_telephone_type_id = models.IntegerField()

class OrganizationRelationship(models.Model):
    organization_relationship_id = models.AutoField(primary_key=True)
    parent_organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='parent_relationships')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='child_relationships')
    ref_organization_relationship_id = models.IntegerField()

class ProgramParticipationSpecialEducation(models.Model):
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    awaiting_initial_idea_evaluation_status = models.BooleanField()
    ref_idea_educational_environment_ec_id = models.IntegerField()
    ref_idea_ed_environment_school_age_id = models.IntegerField()
    special_education_fte = models.DecimalField(max_digits=5, decimal_places=4)
    ref_special_education_exit_reason_id = models.IntegerField()
    special_education_services_exit_date = models.DateField()
    idea_placement_rationale = models.TextField()

class ServicesReceived(models.Model):
    services_received_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    full_time_equivalency = models.DecimalField(max_digits=3, decimal_places=2)
    service_plan = models.ForeignKey('ServicePlan', on_delete=models.CASCADE)

class K12School(models.Model):
    organization = models.OneToOneField(Organization, primary_key=True, on_delete=models.CASCADE)
    ref_school_type_id = models.IntegerField()
    ref_school_level_id = models.IntegerField()
    ref_administrative_funding_control_id = models.IntegerField()
    charter_school_indicator = models.BooleanField()
    ref_charter_school_type_id = models.IntegerField()
    ref_increased_learning_time_type_id = models.IntegerField()
    ref_state_poverty_designation_id = models.IntegerField()
    charter_school_approval_year = models.CharField(max_length=9)
    ref_charter_school_approval_agency_type_id = models.IntegerField()
    accreditation_agency_name = models.CharField(max_length=300)
    charter_school_open_enrollment_indicator = models.BooleanField()
    charter_school_contract_approval_date = models.DateField()
    charter_school_contract_id_number = models.CharField(max_length=30)
    charter_school_contract_renewal_date = models.DateField()
    ref_charter_school_management_organization_type_id = models.IntegerField()

class K12SchoolGradeOffered(models.Model):
    k12_school_grade_offered_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    ref_grade_level_id = models.IntegerField()

class K12SchoolStatus(models.Model):
    organization = models.OneToOneField(Organization, primary_key=True, on_delete=models.CASCADE)
    ref_magnet_special_program_id = models.IntegerField()
    ref_alternative_school_focus_id = models.IntegerField()
    ref_internet_access_id = models.IntegerField()
    ref_restructuring_action_id = models.IntegerField()
    ref_title_i_school_status_id = models.IntegerField()
    consolidated_mep_funds_status = models.BooleanField()
    ref_national_school_lunch_program_status_id = models.IntegerField()
    ref_virtual_school_status_id = models.IntegerField()

class K12SchoolImprovement(models.Model):
    k12_school_improvement_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    ref_school_improvement_status_id = models.IntegerField()
    ref_school_improvement_funds_id = models.IntegerField()
    ref_sig_intervention_type_id = models.IntegerField()
    school_improvement_exit_date = models.DateField()

class K12SchoolCorrectiveAction(models.Model):
    k12_school_corrective_action_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    ref_corrective_action_type_id = models.IntegerField()

class Incident(models.Model):
    incident_id = models.AutoField(primary_key=True)
    incident_identifier = models.CharField(max_length=40)
    incident_date = models.DateField()
    incident_time = models.TimeField()
    ref_incident_time_description_code_id = models.IntegerField()
    incident_description = models.TextField()
    ref_incident_behavior_id = models.IntegerField()
    ref_incident_behavior_secondary_id = models.IntegerField()
    ref_incident_injury_type_id = models.IntegerField()
    ref_weapon_type_id = models.IntegerField()
    incident_cost = models.CharField(max_length=30)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    incident_reporter_id = models.IntegerField()
    ref_incident_reporter_type_id = models.IntegerField()
    ref_incident_location_id = models.IntegerField()
    ref_firearm_type_id = models.IntegerField()
    regulation_violated_description = models.CharField(max_length=100)
    related_to_disability_manifestation_ind = models.BooleanField()
    reported_to_law_enforcement_ind = models.BooleanField()
    ref_incident_multiple_offense_type_id = models.IntegerField()
    ref_incident_perpetrator_injury_type_id = models.IntegerField()

class IncidentPerson(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    identifier = models.CharField(max_length=40)
    ref_incident_person_role_type_id = models.IntegerField()
    ref_incident_person_type_id = models.IntegerField()

    class Meta:
        unique_together = ('incident', 'person', 'ref_incident_person_role_type_id')

class CourseSectionLocation(models.Model):
    course_section_location_id = models.AutoField(primary_key=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    ref_instruction_location_type_id = models.IntegerField()

class CourseSectionSchedule(models.Model):
    course_section_schedule_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    class_meeting_days = models.CharField(max_length=60)
    class_beginning_time = models.TimeField()
    class_ending_time = models.TimeField()
    class_period = models.CharField(max_length=30)
    time_day_identifier = models.CharField(max_length=40)

class IndividualizedProgram(models.Model):
    individualized_program_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    ref_individualized_program_date_type = models.IntegerField()
    individualized_program_date = models.DateField()
    non_inclusion_minutes_per_week = models.IntegerField()
    inclusion_minutes_per_week = models.IntegerField()
    ref_individualized_program_transition_type_id = models.IntegerField()
    ref_individualized_program_type_id = models.IntegerField()
    service_plan_date = models.DateField()
    ref_individualized_program_location_id = models.IntegerField()
    service_plan_meeting_participants = models.CharField(max_length=4000)
    service_plan_signed_by = models.CharField(max_length=4000)
    service_plan_signature_date = models.DateField()
    service_plan_reevaluation_date = models.DateField()
    ref_student_support_service_type_id = models.IntegerField()
    inclusive_setting_indicator = models.BooleanField()
    service_plan_end_date = models.DateField()
    transfer_of_rights_statement = models.TextField()

class RefOrganizationRelationship(models.Model):
    ref_organization_relationship_id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    definition = models.CharField(max_length=4000)
    ref_jurisdiction_id = models.IntegerField()
    sort_order = models.DecimalField(max_digits=5, decimal_places=2)

class OrganizationIdentifier(models.Model):
    organization_identifier_id = models.AutoField(primary_key=True)
    identifier = models.CharField(max_length=40)
    ref_organization_identification_system_id = models.IntegerField()
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    ref_organization_identifier_type_id = models.IntegerField()

class OrganizationOperationalStatus(models.Model):
    organization_operational_status_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    ref_operational_status_id = models.IntegerField()
    operational_status_effective_date = models.DateField()

class OrganizationLocation(models.Model):
    organization_location_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    ref_organization_location_type_id = models.IntegerField()

class OrganizationIndicator(models.Model):
    organization_indicator_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    indicator_value = models.CharField(max_length=50)
    ref_organization_indicator_id = models.IntegerField()

class StaffEmployment(models.Model):
    staff_employment_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    hire_date = models.DateField()
    position_title = models.CharField(max_length=45)
    ref_employment_separation_type_id = models.IntegerField()
    ref_employment_separation_reason_id = models.IntegerField()
    union_membership_name = models.CharField(max_length=200, null=True, blank=True)
    weeks_employed_per_year = models.IntegerField()

class K12StaffEmployment(models.Model):
    staff_employment = models.OneToOneField(StaffEmployment, primary_key=True, on_delete=models.CASCADE)
    ref_k12_staff_classification_id = models.IntegerField()
    ref_employment_status_id = models.IntegerField()
    contract_days_of_service_per_year = models.DecimalField(max_digits=5, decimal_places=2)
    staff_compensation_base_salary = models.DecimalField(max_digits=9, decimal_places=2)
    staff_compensation_retirement_benefits = models.DecimalField(max_digits=9, decimal_places=2)
    staff_compensation_health_benefits = models.DecimalField(max_digits=9, decimal_places=2)
    staff_compensation_other_benefits = models.DecimalField(max_digits=9, decimal_places=2)
    staff_compensation_total_benefits = models.DecimalField(max_digits=9, decimal_places=2)
    staff_compensation_total_salary = models.DecimalField(max_digits=9, decimal_places=2)
    mep_personnel_indicator = models.BooleanField()
    title_i_targeted_assistance_staff_funded = models.BooleanField()
    salary_for_teaching_assignment_only_indicator = models.BooleanField()

class K12StaffAssignment(models.Model):
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    ref_k12_staff_classification_id = models.IntegerField()
    ref_professional_education_job_classification_id = models.IntegerField()
    ref_teaching_assignment_role_id = models.IntegerField()
    primary_assignment = models.BooleanField()
    teacher_of_record = models.BooleanField()
    ref_classroom_position_type_id = models.IntegerField()
    full_time_equivalency = models.DecimalField(max_digits=5, decimal_places=4)
    contribution_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    itinerant_teacher = models.BooleanField()
    highly_qualified_teacher_indicator = models.BooleanField()
    special_education_teacher = models.BooleanField()
    ref_special_education_staff_category_id = models.IntegerField()
    special_education_related_services_personnel = models.BooleanField()
    special_education_paraprofessional = models.BooleanField()
    ref_special_education_age_group_taught_id = models.IntegerField()
    ref_mep_staff_category_id = models.IntegerField()
    ref_title_i_program_staff_category_id = models.IntegerField()

class PersonProgramParticipation(models.Model):
    organization_person_role = models.OneToOneField(OrganizationPersonRole, primary_key=True, on_delete=models.CASCADE)
    ref_participation_type_id = models.IntegerField()
    ref_program_exit_reason_id = models.IntegerField()
    participation_status = models.CharField(max_length=100)

class ActivityRecognition(models.Model):
    activity_recognition_id = models.AutoField(primary_key=True)
    organization_person_role = models.ForeignKey(OrganizationPersonRole, on_delete=models.CASCADE)
    ref_activity_recognition_type_id = models.IntegerField()

class ServicePlan(models.Model):
    service_plan_id = models.AutoField(primary_key=True)
    # Campos adicionales según se necesiten

class OrganizationCalendarDay(models.Model):
    organization_calendar_day_id = models.AutoField(primary_key=True)
    organization_calendar = models.ForeignKey(OrganizationCalendar, on_delete=models.CASCADE)
    day_name = models.CharField(max_length=30)
    alternate_day_name = models.CharField(max_length=30, null=True, blank=True)

class PersonDegreeOrCertificate(models.Model):
    person_degree_or_certificate_id = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    degree_or_certificate_title_or_subject = models.CharField(max_length=45)
    ref_degree_or_certificate_type_id = models.IntegerField()
    award_date = models.DateField()
    name_of_institution = models.CharField(max_length=60)
    ref_higher_education_institution_accreditation_status_id = models.IntegerField()
    ref_education_verification_method_id = models.IntegerField()

