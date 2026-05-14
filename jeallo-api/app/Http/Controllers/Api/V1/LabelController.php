<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Label;
use App\Models\Workspace;
use App\Http\Resources\LabelResource;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(Workspace $workspace)
    {
        return LabelResource::collection($workspace->labels);
    }

    public function store(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'required|string|max:7',
        ]);

        $label = $workspace->labels()->create($validated);

        return new LabelResource($label);
    }

    public function update(Request $request, Label $label)
    {
        $label->update($request->validate([
            'name' => 'sometimes|string|max:50',
            'color' => 'sometimes|string|max:7',
        ]));

        return new LabelResource($label);
    }

    public function destroy(Label $label)
    {
        $label->delete();
        return response()->noContent();
    }
}
