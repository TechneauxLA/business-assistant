-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Requires supabase_schema.sql to have been run first.
-- Re-running this is safe (upsert on conflict).

insert into public.engine_config (key, data)
values ('main', $json$
{
  "canon_phases": [
    "Discovery & Requirements",
    "Analysis & Design",
    "Implementation",
    "Testing & UAT",
    "Deployment & Post-Cutover",
    "Project Management",
    "Travel",
    "Misc"
  ],
  "canon_subphases": [
    "Tags / Points",
    "Screens",
    "Alarms",
    "Scripting & Custom Code",
    "Devices & Polling",
    "Facilities",
    "FMS",
    "MSS / Scheduling",
    "Navigation / UI Structure",
    "Testing & UAT",
    "Deployment & Post-Cutover",
    "Discovery & Requirements",
    "Analysis & Design",
    "Implementation",
    "Project Management",
    "Travel",
    "Misc"
  ],
  "roles": [
    "Architect",
    "Expert",
    "Integrator",
    "Specialist",
    "Project Manager"
  ],
  "rates": {
    "Architect": 175,
    "Expert": 155,
    "Integrator": 135,
    "Specialist": 145,
    "Project Manager": 155
  },
  "phase_pcts_by_type": {
    "Migration": {
      "Discovery & Requirements": 1.3,
      "Analysis & Design": 1.5,
      "Implementation": 53.7,
      "Testing & UAT": 28.6,
      "Deployment & Post-Cutover": 4.7,
      "Project Management": 0.3,
      "Travel": 0.0,
      "Misc": 0.1
    },
    "Reimplementation / Standardization": {
      "Discovery & Requirements": 4.5,
      "Analysis & Design": 22.7,
      "Implementation": 42.4,
      "Testing & UAT": 21.2,
      "Deployment & Post-Cutover": 8.1,
      "Project Management": 0.2,
      "Travel": 1.0
    },
    "Greenfield / Other": {
      "Discovery & Requirements": 0.2,
      "Analysis & Design": 1.6,
      "Implementation": 6.2,
      "Testing & UAT": 0.1,
      "Deployment & Post-Cutover": 1.6,
      "Project Management": 0.3,
      "Misc": 2.1
    }
  },
  "role_splits_by_phase": {
    "Discovery & Requirements": {
      "Architect": 32.0,
      "Expert": 32.1,
      "Integrator": 23.1,
      "Specialist": 12.8
    },
    "Analysis & Design": {
      "Architect": 19.8,
      "Expert": 27.8,
      "Integrator": 45.4,
      "Specialist": 7.0
    },
    "Implementation": {
      "Architect": 17.6,
      "Expert": 14.2,
      "Integrator": 54.2,
      "Specialist": 14.0
    },
    "Testing & UAT": {
      "Architect": 20.2,
      "Expert": 11.8,
      "Integrator": 63.6,
      "Specialist": 4.5
    },
    "Deployment & Post-Cutover": {
      "Architect": 23.8,
      "Expert": 23.7,
      "Integrator": 43.6,
      "Specialist": 8.9
    },
    "Project Management": {
      "Architect": 92.0,
      "Expert": 6.8,
      "Project Manager": 1.3
    },
    "Travel": {
      "Architect": 26.4,
      "Expert": 43.4,
      "Integrator": 11.3,
      "Specialist": 18.9
    },
    "Misc": {
      "Architect": 94.1,
      "Expert": 2.9,
      "Integrator": 3.1
    }
  },
  "bp_benchmark": {
    "name": "BP - HPU Standardization",
    "project_type": "Reimplementation / Standardization",
    "phases": {
      "Discovery & Requirements": {
        "estimated_hrs": 122,
        "actual_hrs": 115,
        "subphases": {
          "Alarms": { "est": 7, "actual": 0, "Integrator": 0 },
          "Scripting & Custom Code": { "est": 16.5, "actual": 16.5, "Expert": 7, "Integrator": 9.5 },
          "Tags / Points": { "est": 4, "actual": 4, "Expert": 4 },
          "Devices & Polling": { "est": 14, "actual": 14, "Expert": 14 },
          "Facilities": { "est": 44.5, "actual": 44.5, "Integrator": 44.5 },
          "FMS": { "est": 2, "actual": 2, "Expert": 2 },
          "MSS / Scheduling": { "est": 4, "actual": 4, "Expert": 4 },
          "Navigation / UI Structure": { "est": 5, "actual": 5, "Expert": 4, "Integrator": 1 },
          "Tags / Points (Point Transl)": { "est": 7, "actual": 7, "Architect": 1, "Integrator": 6 },
          "Screens": { "est": 18, "actual": 18, "Architect": 7, "Expert": 11 }
        }
      },
      "Analysis & Design": {
        "estimated_hrs": 475,
        "actual_hrs": 475,
        "subphases": {
          "Alarms": { "est": 10, "actual": 10, "Expert": 10 },
          "Scripting & Custom Code": { "est": 39, "actual": 39, "Expert": 13, "Integrator": 25, "Architect": 1 },
          "Devices & Polling": { "est": 52, "actual": 52, "Expert": 52 },
          "Facilities": { "est": 195.5, "actual": 195.5, "Expert": 29.5, "Integrator": 163, "Architect": 3 },
          "FMS": { "est": 2, "actual": 2, "Expert": 2 },
          "MSS / Scheduling": { "est": 4, "actual": 4, "Expert": 4 },
          "Navigation / UI Structure": { "est": 5, "actual": 5, "Expert": 5 },
          "Tags / Points": { "est": 126, "actual": 126, "Integrator": 123, "Architect": 3 },
          "Screens": { "est": 41.5, "actual": 41.5, "Expert": 41.5 }
        }
      },
      "Implementation": {
        "estimated_hrs": 424,
        "actual_hrs": 424,
        "subphases": {
          "Scripting & Custom Code": { "est": 43, "actual": 43, "Integrator": 43 },
          "Tags / Points": { "est": 86, "actual": 86, "Expert": 1, "Integrator": 82, "Architect": 3 },
          "Tags / Points (CVS)": { "est": 7.5, "actual": 7.5, "Expert": 7.5 },
          "Devices & Polling": { "est": 66, "actual": 66, "Expert": 66 },
          "Facilities": { "est": 98, "actual": 98, "Expert": 21, "Integrator": 77 },
          "Screens": { "est": 123.5, "actual": 123.5, "Expert": 36.5, "Integrator": 85, "Architect": 2 }
        }
      },
      "Testing & UAT": {
        "estimated_hrs": 475.5,
        "actual_hrs": 475.5,
        "subphases": {
          "Testing & UAT": { "est": 473.5, "actual": 473.5, "Expert": 190.5, "Integrator": 195, "Architect": 88 },
          "Update Testing Checklist": { "est": 2, "actual": 2, "Architect": 2 }
        }
      },
      "Deployment & Post-Cutover": {
        "estimated_hrs": 66.5,
        "actual_hrs": 250.5,
        "variance_note": "Significantly underestimated — post-cutover support was 3x the estimate",
        "subphases": {
          "Cutover": { "est": 66.5, "actual": 66.5, "Expert": 24, "Integrator": 21, "Architect": 21.5 },
          "Post-Cutover Support": { "est": 0, "actual": 184, "Expert": 86.5, "Integrator": 74.5, "Architect": 23 }
        }
      },
      "Project Management": {
        "estimated_hrs": 295.5,
        "actual_hrs": 299.5,
        "subphases": {
          "Project Mgmt": { "est": 0, "actual": 104 },
          "Technical Coordination": { "est": 0, "actual": 50 },
          "Project Meetings": { "est": 295.5, "actual": 141.5 },
          "Project Update Plan": { "est": 0, "actual": 4 }
        }
      }
    },
    "totals": {
      "estimated_hrs": 1959,
      "actual_hrs": 1832.5,
      "variance_hrs": -126.5,
      "variance_pct": -6.5
    },
    "role_rates": {
      "Architect": 175,
      "Expert": 155,
      "Integrator": 135,
      "Specialist": 145,
      "Project Manager": 155
    }
  },
  "example_projects": {
    "BP_HPU_STD": {
      "id": "BP_HPU_STD",
      "name": "BP – HPU Standardization",
      "project_type": "Reimplementation / Standardization",
      "platform": "CygNet",
      "data_source": "BP_PR.xlsx — Estimate & Actual tabs",
      "totals": {
        "estimated_hrs": 1959,
        "actual_hrs": 1832.5,
        "variance_hrs": -126.5,
        "variance_pct": -6.5,
        "estimated_cost": 291480,
        "roles_actual": {
          "Architect": 156.5,
          "Expert": 667.5,
          "Integrator": 1008.5
        }
      },
      "pm_breakdown": {
        "total_hrs": 299.5,
        "subphases": {
          "Project Mgmt": { "actual_hrs": 104 },
          "Technical Coordination": { "actual_hrs": 50 },
          "Project Meetings": { "actual_hrs": 141.5 },
          "Project Update Plan": { "actual_hrs": 4 }
        }
      },
      "phases": [
        {
          "phase": "Discovery & Requirements",
          "weeks": 8,
          "resources": 3,
          "estimated_hrs": 122,
          "actual_hrs": 115,
          "variance_hrs": -7,
          "roles_actual": { "Architect": 8, "Expert": 46, "Integrator": 61 },
          "subphases": [
            { "name": "Alarms", "est": 7, "actual": 0, "Architect": 0, "Expert": 0, "Integrator": 0, "note": "Not performed — excluded from scope" },
            { "name": "Scripting & Custom Code", "est": 16.5, "actual": 16.5, "Architect": 0, "Expert": 7, "Integrator": 9.5 },
            { "name": "Tags / Points (CVS Meta)", "est": 4, "actual": 4, "Architect": 0, "Expert": 4, "Integrator": 0 },
            { "name": "Devices & Polling", "est": 14, "actual": 14, "Architect": 0, "Expert": 14, "Integrator": 0 },
            { "name": "Facilities", "est": 44.5, "actual": 44.5, "Architect": 1, "Expert": 6, "Integrator": 47 },
            { "name": "FMS", "est": 2, "actual": 2, "Architect": 0, "Expert": 2, "Integrator": 0 },
            { "name": "MSS / Scheduling", "est": 4, "actual": 4, "Architect": 0, "Expert": 4, "Integrator": 0 },
            { "name": "Navigation / UI Structure", "est": 5, "actual": 5, "Architect": 0, "Expert": 4, "Integrator": 1 },
            { "name": "Tags / Points", "est": 7, "actual": 7, "Architect": 1, "Expert": 0, "Integrator": 6 },
            { "name": "Screens", "est": 18, "actual": 18, "Architect": 7, "Expert": 11, "Integrator": 0 }
          ]
        },
        {
          "phase": "Analysis & Design",
          "weeks": 10,
          "resources": 3,
          "estimated_hrs": 475,
          "actual_hrs": 475,
          "variance_hrs": 0,
          "roles_actual": { "Architect": 7, "Expert": 157, "Integrator": 311 },
          "subphases": [
            { "name": "Alarms", "est": 10, "actual": 10, "Architect": 0, "Expert": 10, "Integrator": 0 },
            { "name": "Scripting & Custom Code", "est": 39, "actual": 39, "Architect": 1, "Expert": 13, "Integrator": 25 },
            { "name": "Devices & Polling", "est": 52, "actual": 52, "Architect": 0, "Expert": 52, "Integrator": 0 },
            { "name": "Facilities", "est": 195.5, "actual": 195.5, "Architect": 3, "Expert": 29.5, "Integrator": 163 },
            { "name": "FMS", "est": 2, "actual": 2, "Architect": 0, "Expert": 2, "Integrator": 0 },
            { "name": "MSS / Scheduling", "est": 4, "actual": 4, "Architect": 0, "Expert": 4, "Integrator": 0 },
            { "name": "Navigation / UI Structure", "est": 5, "actual": 5, "Architect": 0, "Expert": 5, "Integrator": 0 },
            { "name": "Tags / Points", "est": 126, "actual": 126, "Architect": 3, "Expert": 0, "Integrator": 123 },
            { "name": "Screens", "est": 41.5, "actual": 41.5, "Architect": 0, "Expert": 41.5, "Integrator": 0 }
          ]
        },
        {
          "phase": "Implementation",
          "weeks": 6,
          "resources": 3,
          "estimated_hrs": 424,
          "actual_hrs": 424,
          "variance_hrs": 0,
          "roles_actual": { "Architect": 5, "Expert": 132, "Integrator": 287 },
          "subphases": [
            { "name": "Scripting & Custom Code", "est": 43, "actual": 43, "Architect": 0, "Expert": 0, "Integrator": 43 },
            { "name": "Tags / Points (CVS Meta)", "est": 7.5, "actual": 7.5, "Architect": 0, "Expert": 7.5, "Integrator": 0 },
            { "name": "Devices & Polling", "est": 66, "actual": 66, "Architect": 0, "Expert": 66, "Integrator": 0 },
            { "name": "Facilities", "est": 98, "actual": 98, "Architect": 0, "Expert": 21, "Integrator": 77 },
            { "name": "Tags / Points", "est": 86, "actual": 86, "Architect": 3, "Expert": 1, "Integrator": 82 },
            { "name": "Screens", "est": 123.5, "actual": 123.5, "Architect": 2, "Expert": 36.5, "Integrator": 85 }
          ]
        },
        {
          "phase": "Testing & UAT",
          "weeks": 4,
          "resources": 3,
          "estimated_hrs": 475.5,
          "actual_hrs": 475.5,
          "variance_hrs": 0,
          "roles_actual": { "Architect": 90, "Expert": 190.5, "Integrator": 195 },
          "subphases": [
            { "name": "UAT Testing / Server Prep", "est": 473.5, "actual": 473.5, "Architect": 88, "Expert": 190.5, "Integrator": 195 },
            { "name": "Update Testing Checklist", "est": 2, "actual": 2, "Architect": 2, "Expert": 0, "Integrator": 0 }
          ]
        },
        {
          "phase": "Deployment & Post-Cutover",
          "weeks": 3,
          "resources": 3,
          "estimated_hrs": 66.5,
          "actual_hrs": 250.5,
          "variance_hrs": 184,
          "variance_note": "Post-cutover support was not scoped — ran 3.8× the estimate",
          "roles_actual": { "Architect": 44.5, "Expert": 110.5, "Integrator": 95.5 },
          "subphases": [
            { "name": "Cutover", "est": 66.5, "actual": 66.5, "Architect": 21.5, "Expert": 24, "Integrator": 21 },
            { "name": "Post-Cutover Support", "est": 0, "actual": 184, "Architect": 23, "Expert": 86.5, "Integrator": 74.5, "variance_note": "Unscoped — ran entirely as overrun" }
          ]
        },
        {
          "phase": "Project Management",
          "weeks": null,
          "resources": null,
          "estimated_hrs": 295.5,
          "actual_hrs": 299.5,
          "variance_hrs": 4,
          "roles_actual": { "Architect": 0, "Expert": 0, "Integrator": 0, "Project Manager": 299.5 },
          "subphases": [
            { "name": "Project Meetings", "est": 295.5, "actual": 141.5, "Architect": 0, "Expert": 0, "Integrator": 0, "PM": 141.5 },
            { "name": "Project Mgmt", "est": 0, "actual": 104, "Architect": 0, "Expert": 0, "Integrator": 0, "PM": 104 },
            { "name": "Technical Coordination", "est": 0, "actual": 50, "Architect": 0, "Expert": 0, "Integrator": 0, "PM": 50 },
            { "name": "Project Update Plan", "est": 0, "actual": 4, "Architect": 0, "Expert": 0, "Integrator": 0, "PM": 4 }
          ]
        }
      ],
      "insights": [
        {
          "type": "overrun",
          "phase": "Deployment & Post-Cutover",
          "severity": "high",
          "text": "Post-cutover support was not included in the original scope estimate. Actual ran 184h over — 3.8× the cutover estimate. This is the single largest variance driver."
        },
        {
          "type": "accurate",
          "phase": "Analysis & Design",
          "text": "Analysis & Design came in exactly on estimate (475h) despite being the most complex phase. The role mix shifted — more Integrator hours, fewer Expert hours than estimated."
        },
        {
          "type": "underrun",
          "phase": "Discovery & Requirements",
          "text": "Discovery came in 7h under (115h vs 122h). Alarms sub-phase (7h estimated) was not performed, likely excluded from final scope."
        },
        {
          "type": "role_shift",
          "phase": "Implementation",
          "text": "Implementation was on-hours but leaned heavily Integrator (68%) — facilities and point translation work drove this. Custom Scripts and Screens were exclusively Integrator-led."
        },
        {
          "type": "pattern",
          "phase": "Testing & UAT",
          "text": "Testing was 28% of project hours (475.5h). Architect utilization was unusually high at 19% — indicating significant architectural oversight required during UAT."
        }
      ]
    }
  }
}
$json$::jsonb)
on conflict (key) do update
  set data       = excluded.data,
      updated_at = now();

select 'Engine config seeded.' as status;
